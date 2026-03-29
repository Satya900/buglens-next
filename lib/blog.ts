import { cache } from "react";

type NotionRichText = {
  plain_text?: string;
};

type NotionFile =
  | {
      type: "external";
      external?: {
        url?: string;
      };
      name?: string;
    }
  | {
      type: "file";
      file?: {
        url?: string;
        expiry_time?: string;
      };
      name?: string;
    };

type BlogBlock =
  | { type: "paragraph"; text: string; id: string }
  | { type: "heading_2"; text: string; id: string }
  | { type: "heading_3"; text: string; id: string }
  | { type: "quote"; text: string; id: string }
  | { type: "callout"; text: string; id: string }
  | { type: "code"; text: string; language?: string; id: string }
  | { type: "bulleted_list_item"; text: string; id: string }
  | { type: "numbered_list_item"; text: string; id: string }
  | { type: "image"; url: string; caption?: string; id: string }
  | { type: "divider"; id: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: BlogBlock[];
  tag: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  coverImageForMetadata?: string;
};

const fallbackPosts: BlogPost[] = [
  {
    slug: "langgraph-over-langchain",
    tag: "architecture",
    title: "Why I chose LangGraph over LangChain for multi-agent orchestration",
    excerpt:
      "State machines beat chains when your agents need to loop, retry, and share context. Here is the architecture that drove the decision.",
    author: "Satyabrata Mohanty",
    publishedAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-03-28T00:00:00.000Z",
    readTime: "6 min read",
    seoTitle: "Why BugLens uses LangGraph for multi-agent PR reviews",
    seoDescription:
      "A technical breakdown of why BugLens uses LangGraph instead of LangChain for stateful, context-rich pull request review workflows.",
    content: [
      {
        type: "paragraph",
        id: "fb-1-1",
        text: "Multi-agent review systems fail when orchestration stays linear. Real review pipelines branch, retry, and revisit context as new evidence appears.",
      },
      {
        type: "paragraph",
        id: "fb-1-2",
        text: "BugLens is built around that constraint. The Lens agent inspects diffs, the Context agent pulls standards and prior decisions, and the Review agent turns that into a developer-facing verdict.",
      },
      {
        type: "paragraph",
        id: "fb-1-3",
        text: "LangGraph made that statefulness explicit. Instead of encoding complex control flow inside prompts, the workflow remains inspectable and easier to debug as the product grows.",
      },
    ],
  },
  {
    slug: "rag-for-team-standards",
    tag: "deep dive",
    title: "How BugLens uses RAG to review code with your team's own standards",
    excerpt:
      "Generic LLM reviews are useless without context. Here is how we embed docs, past PRs, and RFCs into every review.",
    author: "Satyabrata Mohanty",
    publishedAt: "2026-03-21T00:00:00.000Z",
    updatedAt: "2026-03-21T00:00:00.000Z",
    readTime: "8 min read",
    seoDescription:
      "How BugLens uses retrieval-augmented generation so code reviews reflect the team's own architecture docs, RFCs, and historical pull request context.",
    content: [
      {
        type: "paragraph",
        id: "fb-2-1",
        text: "Code review quality is bounded by context quality. A model that only sees the diff will overfit to generic best practices and miss team-specific constraints.",
      },
      {
        type: "paragraph",
        id: "fb-2-2",
        text: "The BugLens retrieval layer indexes docs, RFCs, and historical reviews so the reviewer can explain why something violates a local convention instead of hand-waving.",
      },
      {
        type: "paragraph",
        id: "fb-2-3",
        text: "That context also improves trust. Engineers are more likely to accept review feedback when the reasoning points back to standards they already use.",
      },
    ],
  },
  {
    slug: "ast-sql-injection-lessons",
    tag: "security",
    title: "AST-based SQL injection detection: lessons from EnginIQ",
    excerpt:
      "Before BugLens, I built EnginIQ to protect Postgres from AI-generated SQL. The same AST techniques now power BugLens's scanner agent.",
    author: "Satyabrata Mohanty",
    publishedAt: "2026-03-14T00:00:00.000Z",
    updatedAt: "2026-03-14T00:00:00.000Z",
    readTime: "5 min read",
    seoDescription:
      "Lessons from AST-based SQL injection detection and how that work influences BugLens security analysis for pull request review.",
    content: [
      {
        type: "paragraph",
        id: "fb-3-1",
        text: "Pattern matching is fast, but security review needs more than regex. Structural parsing is what makes it possible to distinguish dangerous interpolation from safe parameterization.",
      },
      {
        type: "paragraph",
        id: "fb-3-2",
        text: "That lesson carried directly into BugLens. Security feedback only matters if the review can point at the code shape that makes an issue real.",
      },
      {
        type: "paragraph",
        id: "fb-3-3",
        text: "A good scanner does not just find risk. It reduces noise enough that developers continue trusting the tool after the first week.",
      },
    ],
  },
  {
    slug: "mcp-usb-c-moment",
    tag: "mcp",
    title: "MCP in 2026: why it is the USB-C moment for AI agents",
    excerpt:
      "Model Context Protocol went from niche spec to the default integration layer for AI tooling. Here is what that changes.",
    author: "Satyabrata Mohanty",
    publishedAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
    readTime: "4 min read",
    seoDescription:
      "Why MCP matters for AI tooling and how BugLens uses protocol-native integrations to expose review context across developer workflows.",
    content: [
      {
        type: "paragraph",
        id: "fb-4-1",
        text: "The protocol matters because it lowers integration cost. Instead of hand-building bespoke connectors for every surface, tools can expose capabilities through a common interface.",
      },
      {
        type: "paragraph",
        id: "fb-4-2",
        text: "That matters for BugLens because review findings should not be trapped inside a single dashboard. The same context should be available in IDEs, PR flows, and agents.",
      },
      {
        type: "paragraph",
        id: "fb-4-3",
        text: "Standardization does not remove product differentiation. It lets product work focus on insight quality rather than one-off plumbing.",
      },
    ],
  },
];

const notionConfig = {
  token: process.env.NOTION_TOKEN,
  databaseId: process.env.NOTION_DATABASE_ID,
  version: "2022-06-28",
};

function isNotionConfigured() {
  return Boolean(notionConfig.token && notionConfig.databaseId);
}

function asPlainText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return typeof (item as NotionRichText).plain_text === "string"
        ? (item as NotionRichText).plain_text!
        : "";
    })
    .join("")
    .trim();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function propertyEntries(
  properties: Record<string, Record<string, unknown>>
): Array<[string, Record<string, unknown>]> {
  return Object.entries(properties);
}

function findProperty(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const lowerNames = names.map((name) => name.toLowerCase());

  for (const [key, value] of propertyEntries(properties)) {
    if (lowerNames.includes(key.toLowerCase())) {
      return value;
    }
  }

  return undefined;
}

function findPropertyByType(
  properties: Record<string, Record<string, unknown>>,
  type: string
) {
  return propertyEntries(properties).find(([, value]) => value.type === type)?.[1];
}

function getTitleFromProperties(properties: Record<string, Record<string, unknown>>) {
  const titleProperty = findPropertyByType(properties, "title");
  return asPlainText((titleProperty?.title as unknown[]) ?? []);
}

function getRichTextValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  return asPlainText((property?.rich_text as unknown[]) ?? []);
}

function getSelectValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  const select = property?.select as { name?: string } | undefined;
  return select?.name?.trim() ?? "";
}

function getStatusValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  const status = property?.status as { name?: string } | undefined;
  return status?.name?.trim() ?? "";
}

function getDateValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  const date = property?.date as { start?: string } | undefined;
  return date?.start?.trim() ?? "";
}

function getCheckboxValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  return property?.checkbox === true;
}

function getFilesValue(
  properties: Record<string, Record<string, unknown>>,
  names: string[]
) {
  const property = findProperty(properties, names);
  return Array.isArray(property?.files) ? (property.files as NotionFile[]) : [];
}

function getFileUrl(file?: NotionFile) {
  if (!file) {
    return undefined;
  }

  if (file.type === "external") {
    return file.external?.url;
  }

  return file.file?.url;
}

function getDurableFileUrl(file?: NotionFile) {
  if (!file) {
    return undefined;
  }

  if (file.type === "external") {
    return file.external?.url;
  }

  return undefined;
}

function extractPageCover(page: Record<string, unknown>) {
  const cover = page.cover as
    | {
        type?: "external" | "file";
        external?: { url?: string };
        file?: { url?: string };
      }
    | undefined;

  if (!cover) {
    return {};
  }

  if (cover.type === "external") {
    return {
      coverImage: cover.external?.url,
      coverImageForMetadata: cover.external?.url,
    };
  }

  return {
    coverImage: cover.file?.url,
  };
}

function deriveExcerpt(content: BlogBlock[]) {
  const firstParagraph = content.find(
    (block) => block.type === "paragraph" && block.text.trim().length > 0
  );

  return firstParagraph && "text" in firstParagraph ? firstParagraph.text : "";
}

function computeReadTime(content: BlogBlock[]) {
  const text = content
    .map((block) =>
      "text" in block && typeof block.text === "string" ? block.text : ""
    )
    .join(" ")
    .trim();

  const wordCount = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

async function notionFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${notionConfig.token}`,
      "Content-Type": "application/json",
      "Notion-Version": notionConfig.version,
      ...(init?.headers ?? {}),
    },
    next: {
      revalidate: 3600,
      ...(init as { next?: { revalidate?: number } } | undefined)?.next,
    },
  });

  if (!response.ok) {
    throw new Error(`Notion request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

function mapBlock(block: Record<string, unknown>): BlogBlock | null {
  const type = block.type;
  const id = typeof block.id === "string" ? block.id : "";

  if (typeof type !== "string" || !id) {
    return null;
  }

  const payload = block[type] as Record<string, unknown> | undefined;

  if (!payload && type !== "divider") {
    return null;
  }

  const text = asPlainText((payload?.rich_text as unknown[]) ?? []);

  switch (type) {
    case "paragraph":
      return text ? { type, text, id } : null;
    case "heading_2":
      return text ? { type, text, id } : null;
    case "heading_3":
      return text ? { type, text, id } : null;
    case "quote":
      return text ? { type, text, id } : null;
    case "callout":
      return text ? { type, text, id } : null;
    case "code":
      return text
        ? {
            type,
            text,
            language:
              typeof payload?.language === "string" ? payload.language : undefined,
            id,
          }
        : null;
    case "bulleted_list_item":
      return text ? { type, text, id } : null;
    case "numbered_list_item":
      return text ? { type, text, id } : null;
    case "image": {
      const image = payload as NotionFile & {
        caption?: unknown[];
      };
      const url = getFileUrl(image);

      return url
        ? {
            type,
            url,
            caption: asPlainText((image.caption as unknown[]) ?? []) || undefined,
            id,
          }
        : null;
    }
    case "divider":
      return { type, id };
    default:
      return null;
  }
}

async function fetchBlockChildren(blockId: string): Promise<BlogBlock[]> {
  const blocks: BlogBlock[] = [];
  let cursor: string | undefined;

  do {
    const search = new URLSearchParams();
    if (cursor) {
      search.set("start_cursor", cursor);
    }

    const payload = await notionFetch<{
      results?: Record<string, unknown>[];
      has_more?: boolean;
      next_cursor?: string | null;
    }>(`/blocks/${blockId}/children?${search.toString()}`);

    for (const result of payload.results ?? []) {
      const mapped = mapBlock(result);
      if (mapped) {
        blocks.push(mapped);
      }
    }

    cursor = payload.has_more ? payload.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

async function mapNotionPost(result: Record<string, unknown>): Promise<BlogPost | null> {
  const properties = (result.properties ?? {}) as Record<string, Record<string, unknown>>;
  const pageId = typeof result.id === "string" ? result.id : "";
  const title = getTitleFromProperties(properties);
  const explicitSlug = getRichTextValue(properties, ["Slug", "slug"]);
  const slug = explicitSlug || slugify(title);
  const content = pageId ? await fetchBlockChildren(pageId) : [];
  const excerpt =
    getRichTextValue(properties, ["Excerpt", "Summary", "Description"]) ||
    deriveExcerpt(content);
  const author =
    getRichTextValue(properties, ["Author", "author"]) ||
    getRichTextValue(properties, ["Byline"]) ||
    "BugLens";
  const tag =
    getSelectValue(properties, ["Tag", "Category"]) ||
    getStatusValue(properties, ["CategoryStatus"]) ||
    "blog";
  const publishedAt =
    getDateValue(properties, ["PublishedAt", "Publish Date", "Published"]) ||
    (typeof result.created_time === "string" ? result.created_time : new Date().toISOString());
  const updatedAt =
    getDateValue(properties, ["UpdatedAt", "Updated"]) ||
    (typeof result.last_edited_time === "string"
      ? result.last_edited_time
      : publishedAt);
  const seoTitle = getRichTextValue(properties, ["SeoTitle", "SEO Title"]);
  const seoDescription = getRichTextValue(properties, [
    "SeoDescription",
    "SEO Description",
    "Meta Description",
  ]);
  const readTime =
    getRichTextValue(properties, ["ReadTime", "Read Time"]) ||
    computeReadTime(content);
  const files = getFilesValue(properties, ["CoverImage", "Cover", "HeroImage"]);
  const fileCover = files[0];
  const pageCover = extractPageCover(result);
  const published =
    getCheckboxValue(properties, ["Published"]) ||
    getStatusValue(properties, ["Status"]).toLowerCase() === "published" ||
    !findProperty(properties, ["Published", "Status"]);

  if (!published || !title || !slug) {
    return null;
  }

  return {
    slug,
    title,
    excerpt: excerpt || title,
    content: content.length > 0 ? content : [{ type: "paragraph", id: "default-1", text: excerpt || title }],
    tag,
    author,
    publishedAt,
    updatedAt,
    readTime,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
    coverImage: getFileUrl(fileCover) ?? pageCover.coverImage,
    coverImageForMetadata:
      getDurableFileUrl(fileCover) ?? pageCover.coverImageForMetadata,
  };
}

async function fetchNotionPosts(): Promise<BlogPost[]> {
  if (!isNotionConfigured()) {
    return fallbackPosts;
  }

  const payload = await notionFetch<{
    results?: Record<string, unknown>[];
  }>(`/databases/${notionConfig.databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  const posts = await Promise.all((payload.results ?? []).map(mapNotionPost));
  const filtered = posts.filter((post): post is BlogPost => Boolean(post));

  return filtered.length > 0 ? filtered : fallbackPosts;
}

export const getPublishedPosts = cache(async () => {
  const posts = await fetchNotionPosts();

  return [...posts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
});

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});
