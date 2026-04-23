import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  AssistantChatMessage,
  AssistantViewer,
  assistantSystemPrompt,
  extractAssistantKeywords,
  labelPathname,
  shouldLookupMarketplaceData,
} from "@/lib/assistant";

const DEFAULT_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";

function sanitizeEnvValue(value?: string) {
  if (!value) {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
}

async function extractUpstreamError(response: Response) {
  const responseText = await response.text();

  try {
    const parsed = JSON.parse(responseText) as {
      error?: {
        message?: string;
        metadata?: {
          raw?: string;
        };
      };
    };

    return (
      parsed.error?.metadata?.raw?.trim() ||
      parsed.error?.message?.trim() ||
      responseText.trim()
    );
  } catch {
    return responseText.trim();
  }
}

function normalizeMessages(input: unknown): AssistantChatMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((message): message is AssistantChatMessage => {
      return (
        Boolean(message) &&
        typeof message === "object" &&
        "role" in message &&
        "content" in message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .slice(-10);
}

function extractViewer(input: unknown): AssistantViewer {
  if (!input || typeof input !== "object") {
    return {};
  }

  const maybeViewer = input as AssistantViewer;

  return {
    id: typeof maybeViewer.id === "string" ? maybeViewer.id : null,
    name: typeof maybeViewer.name === "string" ? maybeViewer.name : null,
    isAuthenticated: Boolean(maybeViewer.isAuthenticated),
  };
}

function buildPersonalization(viewer: AssistantViewer, pathname?: string | null) {
  const viewerLabel = viewer.isAuthenticated
    ? `Authenticated user${viewer.name ? ` named ${viewer.name}` : ""}`
    : "Guest visitor";

  return `Current page: ${labelPathname(pathname)}.\nViewer: ${viewerLabel}.`;
}

function formatItems(
  items: Array<{
    id: string;
    title: string;
    price: number;
    condition: string;
    category: { name: string } | null;
    seller: { name: string | null } | null;
  }>
) {
  if (items.length === 0) {
    return "No matching live items were found for that query.";
  }

  return items
    .map((item) => {
      const sellerName = item.seller?.name?.trim() || "seller";
      const categoryName = item.category?.name || "Uncategorized";
      return `- ${item.title} | ${categoryName} | Rs ${item.price} | ${item.condition} | seller: ${sellerName} | path: /item/${item.id}`;
    })
    .join("\n");
}

async function buildMarketplaceContext(userMessage: string) {
  const [activeItemsCount, featuredItemsCount, categories] = await Promise.all([
    db.item.count({ where: { isSold: false } }),
    db.item.count({ where: { isSold: false, isFeatured: true } }),
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const lowerMessage = userMessage.toLowerCase();
  const matchedCategory = categories.find((category) =>
    lowerMessage.includes(category.name.toLowerCase())
  );

  let relevantItems: Array<{
    id: string;
    title: string;
    price: number;
    condition: string;
    category: { name: string } | null;
    seller: { name: string | null } | null;
  }> = [];

  if (shouldLookupMarketplaceData(userMessage)) {
    const keywords = extractAssistantKeywords(userMessage);
    const searchClauses = keywords.flatMap((keyword) => [
      { title: { contains: keyword, mode: "insensitive" as const } },
      { description: { contains: keyword, mode: "insensitive" as const } },
    ]);

    const whereClause =
      matchedCategory || searchClauses.length > 0
        ? {
            isSold: false,
            ...(matchedCategory ? { categoryId: matchedCategory.id } : {}),
            ...(searchClauses.length > 0 ? { OR: searchClauses } : {}),
          }
        : { isSold: false, ...(lowerMessage.includes("featured") ? { isFeatured: true } : {}) };

    relevantItems = await db.item.findMany({
      where: whereClause,
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        condition: true,
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  const categoriesText = categories
    .map((category) =>
      category.description
        ? `${category.name}: ${category.description}`
        : category.name
    )
    .join(", ");

  return `
Live marketplace context:
- Active unsold items: ${activeItemsCount}
- Featured active items: ${featuredItemsCount}
- Active categories: ${categoriesText || "None"}
${relevantItems.length > 0 || shouldLookupMarketplaceData(userMessage) ? `- Relevant items:\n${formatItems(relevantItems)}` : ""}
`.trim();
}

function extractTextContent(content: unknown) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body.messages);
    const viewer = extractViewer(body.viewer);
    const pathname = typeof body.pathname === "string" ? body.pathname : "/";

    if (messages.length === 0) {
      return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    }

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

    if (!latestUserMessage) {
      return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    }

    const apiKey = sanitizeEnvValue(process.env.OPENROUTER_API_KEY);

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is missing from the environment." },
        { status: 500 }
      );
    }

    const liveMarketplaceContext = await buildMarketplaceContext(latestUserMessage.content);
    const model = sanitizeEnvValue(process.env.OPENROUTER_MODEL) || DEFAULT_MODEL;

    const upstreamResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://collegefreecyclemarket.local",
        "X-Title": "College Freecycle Market Assistant",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 320,
        messages: [
          {
            role: "system",
            content: [
              assistantSystemPrompt,
              buildPersonalization(viewer, pathname),
              liveMarketplaceContext,
            ].join("\n\n"),
          },
          ...messages,
        ],
      }),
    });

    if (!upstreamResponse.ok) {
      const errorText = await extractUpstreamError(upstreamResponse);
      console.error("Assistant upstream error:", errorText);
      return NextResponse.json(
        {
          error:
            errorText ||
            "The assistant provider could not complete the request right now.",
        },
        { status: 502 }
      );
    }

    const data = await upstreamResponse.json();
    const content = extractTextContent(data?.choices?.[0]?.message?.content);

    if (!content) {
      return NextResponse.json(
        { error: "The assistant returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: content,
      model,
    });
  } catch (error) {
    console.error("Assistant route error:", error);
    return NextResponse.json(
      { error: "Failed to process the assistant request." },
      { status: 500 }
    );
  }
}
