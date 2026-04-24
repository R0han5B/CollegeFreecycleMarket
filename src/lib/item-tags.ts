const DEFAULT_MODEL = 'qwen/qwen3-next-80b-a3b-instruct:free';
const tokenSplitPattern = /[^a-z0-9]+/i;

const deterministicTagGroups = [
  [
    'phone',
    'mobile',
    'smartphone',
    'cellphone',
    'iphone',
    'android',
    'samsung',
    'galaxy',
    'realme',
    'redmi',
    'xiaomi',
    'oneplus',
    'oppo',
    'vivo',
    'pixel',
    'nokia',
    'motorola',
  ],
  [
    'laptop',
    'notebook',
    'computer',
    'pc',
    'macbook',
    'thinkpad',
    'ideapad',
    'pavilion',
    'inspiron',
    'vivobook',
    'aspire',
    'dell',
    'lenovo',
    'asus',
    'acer',
    'hp',
  ],
  ['keyboard', 'wireless keyboard', 'mechanical keyboard'],
  ['mouse', 'wired mouse', 'wireless mouse'],
];

export function sanitizeEnvValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
}

export async function extractUpstreamError(response: Response) {
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

export function normalizeToken(token: string) {
  const cleaned = token.trim().toLowerCase();

  if (cleaned.length <= 2) {
    return cleaned;
  }

  if (cleaned.endsWith('ies') && cleaned.length > 4) {
    return `${cleaned.slice(0, -3)}y`;
  }

  if (cleaned.endsWith('es') && cleaned.length > 4) {
    return cleaned.slice(0, -2);
  }

  if (cleaned.endsWith('s') && cleaned.length > 3) {
    return cleaned.slice(0, -1);
  }

  return cleaned;
}

export function tokenize(value: string) {
  return value
    .split(tokenSplitPattern)
    .map(normalizeToken)
    .filter(Boolean);
}

export function dedupeTerms(terms: string[]) {
  return Array.from(
    new Set(
      terms
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 2)
    )
  );
}

function getDeterministicTags(seedTerms: string[]) {
  const normalizedSeeds = dedupeTerms(seedTerms.flatMap((term) => tokenize(term)));
  const expanded = new Set<string>(normalizedSeeds);

  for (const group of deterministicTagGroups) {
    const normalizedGroup = dedupeTerms(group);
    if (normalizedGroup.some((term) => normalizedSeeds.includes(term))) {
      normalizedGroup.forEach((term) => expanded.add(term));
    }
  }

  return Array.from(expanded);
}

export async function generateSuggestedTags(input: {
  title: string;
  description: string;
  categoryName?: string | null;
  existingTags?: string[];
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const categoryName = input.categoryName?.trim() ?? '';
  const existingTags = dedupeTerms(input.existingTags ?? []);
  const deterministicBase = getDeterministicTags([
    title,
    description,
    categoryName,
    ...existingTags,
  ]);
  const apiKey = sanitizeEnvValue(process.env.OPENROUTER_API_KEY);
  const model = sanitizeEnvValue(process.env.OPENROUTER_MODEL) || DEFAULT_MODEL;

  if (!apiKey || (!title && !description && !categoryName)) {
    return deterministicBase.slice(0, 12);
  }

  try {
    const upstreamResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://collegefreecyclemarket.local',
        'X-Title': 'College Freecycle Market Tag Suggestions',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 180,
        messages: [
          {
            role: 'system',
            content: [
              'You generate concise search tags for marketplace listings.',
              'Return JSON only.',
              'Format: {"tags":["iphone","phone","apple","smartphone"]}',
              'Rules:',
              '- lowercase tags only',
              '- 4 to 12 tags',
              '- include broad product type and important brand/model words',
              '- no filler words',
              '- no explanations',
            ].join('\n'),
          },
          {
            role: 'user',
            content: JSON.stringify({
              title,
              description,
              category: categoryName,
              existingTags,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!upstreamResponse.ok) {
      const errorText = await extractUpstreamError(upstreamResponse);
      console.error('Tag suggestion upstream error:', errorText);
      return deterministicBase.slice(0, 12);
    }

    const data = await upstreamResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    const rawText =
      typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content
              .map((part: { text?: string } | string) =>
                typeof part === 'string' ? part : typeof part?.text === 'string' ? part.text : ''
              )
              .join('\n')
          : '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { tags?: string[] }) : null;
    const mergedTags = dedupeTerms([...(parsed?.tags ?? []), ...deterministicBase, ...existingTags]);

    return mergedTags.slice(0, 12);
  } catch (error) {
    console.error('Tag suggestion error:', error);
    return deterministicBase.slice(0, 12);
  }
}

export function buildSearchTokens(item: {
  title: string;
  description: string;
  tags?: string[] | null;
}) {
  return new Set(
    dedupeTerms([
      ...tokenize(item.title),
      ...tokenize(item.description),
      ...(item.tags ?? []).flatMap((tag) => tokenize(tag)),
    ])
  );
}
