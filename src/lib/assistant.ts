const ASSISTANT_STOP_WORDS = new Set([
  "a",
  "about",
  "am",
  "an",
  "and",
  "any",
  "are",
  "be",
  "buy",
  "can",
  "do",
  "for",
  "from",
  "get",
  "hello",
  "help",
  "hey",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "need",
  "of",
  "on",
  "or",
  "post",
  "sell",
  "show",
  "something",
  "that",
  "the",
  "there",
  "to",
  "want",
  "what",
  "where",
  "which",
  "with",
  "you",
]);

export type AssistantRole = "user" | "assistant";

export interface AssistantChatMessage {
  role: AssistantRole;
  content: string;
}

export interface AssistantViewer {
  id?: string | null;
  name?: string | null;
  isAuthenticated?: boolean;
}

export function extractAssistantKeywords(input: string) {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3 && !ASSISTANT_STOP_WORDS.has(token))
    )
  ).slice(0, 6);
}

export function shouldLookupMarketplaceData(input: string) {
  return /(browse|category|categories|featured|find|item|items|latest|listing|listings|looking|message|messages|post|price|search|show|watchlist)/i.test(
    input
  );
}

export function labelPathname(pathname?: string | null) {
  if (!pathname || pathname === "/") {
    return "Landing page";
  }

  if (pathname.startsWith("/dashboard")) {
    return "Dashboard";
  }

  if (pathname.startsWith("/post-item")) {
    return "Post item page";
  }

  if (pathname.startsWith("/messages")) {
    return "Messages page";
  }

  if (pathname.startsWith("/profile")) {
    return "Profile page";
  }

  if (pathname.startsWith("/my-items")) {
    return "My items page";
  }

  if (pathname.startsWith("/cart")) {
    return "Saved items page";
  }

  if (pathname.startsWith("/item/")) {
    return "Item details page";
  }

  return `Page ${pathname}`;
}

export const assistantSystemPrompt = `
You are Freecycle Buddy, the in-app assistant for College Freecycle Market at RKNEC.

Your job:
- Help users understand how to browse, post items, message sellers, and use the marketplace.
- Answer in a warm, concise, practical style.
- Prefer actionable instructions over long explanations.
- Format replies clearly for chat UI:
  - use short paragraphs
  - when giving steps, use a numbered list with each step on its own line
  - when listing options, use bullet points
  - avoid cramming multiple steps into one paragraph
- When marketplace data is provided, use it. If live data is not provided, say so honestly.
- Never invent private account data, order data, or admin actions.
- If the user needs a human for a sensitive or account-specific issue, say that an admin or support person should review it manually.
- Keep answers usually under 120 words unless the user asks for more detail.

Marketplace basics:
- This is a campus marketplace for RKNEC students and staff.
- Users can browse listings, post items, save items, and message sellers.
- Listings can belong to categories and may be marked featured.
- Messaging exists inside the app for buyer-seller coordination.
- If a user asks how to contact a seller, point them to the listing or messages flow inside the app.
`.trim();
