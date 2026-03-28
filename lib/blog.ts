import { cache } from "react";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tag: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
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
      "Multi-agent review systems fail when orchestration stays linear. Real review pipelines branch, retry, and revisit context as new evidence appears.",
      "BugLens is built around that constraint. The Lens agent inspects diffs, the Context agent pulls standards and prior decisions, and the Review agent turns that into a developer-facing verdict.",
      "LangGraph made that statefulness explicit. Instead of encoding complex control flow inside prompts, the workflow remains inspectable and easier to debug as the product grows.",
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
      "Code review quality is bounded by context quality. A model that only sees the diff will overfit to generic best practices and miss team-specific constraints.",
      "The BugLens retrieval layer indexes docs, RFCs, and historical reviews so the reviewer can explain why something violates a local convention instead of hand-waving.",
      "That context also improves trust. Engineers are more likely to accept review feedback when the reasoning points back to standards they already use.",
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
      "Pattern matching is fast, but security review needs more than regex. Structural parsing is what makes it possible to distinguish dangerous interpolation from safe parameterization.",
      "That lesson carried directly into BugLens. Security feedback only matters if the review can point at the code shape that makes an issue real.",
      "A good scanner does not just find risk. It reduces noise enough that developers continue trusting the tool after the first week.",
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
      "The protocol matters because it lowers integration cost. Instead of hand-building bespoke connectors for every surface, tools can expose capabilities through a common interface.",
      "That matters for BugLens because review findings should not be trapped inside a single dashboard. The same context should be available in IDEs, PR flows, and agents.",
      "Standardization does not remove product differentiation. It lets product work focus on insight quality rather than one-off plumbing.",
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

      const text = (item as { plain_text?: string }).plain_text;
      return typeof text === "string" ? text : "";
    })
    .join("")
    .trim();
}

function mapNotionPost(result: Record<string, unknown>): BlogPost | null {
  const properties = (result.properties ?? {}) as Record<string, Record<string, unknown>>;

  const slug = (properties.Slug?.rich_text as unknown[]) ?? [];
  const title = (properties.Title?.title as unknown[]) ?? [];
  const excerpt = (properties.Excerpt?.rich_text as unknown[]) ?? [];
  const author = (properties.Author?.rich_text as unknown[]) ?? [];
  const tag = properties.Tag?.select as { name?: string } | undefined;
  const publishedAt = properties.PublishedAt?.date as
    | { start?: string }
    | undefined;
  const updatedAt = properties.UpdatedAt?.date as
    | { start?: string }
    | undefined;
  const readTime = (properties.ReadTime?.rich_text as unknown[]) ?? [];
  const seoTitle = (properties.SeoTitle?.rich_text as unknown[]) ?? [];
  const seoDescription = (properties.SeoDescription?.rich_text as unknown[]) ?? [];
  const published = properties.Published?.checkbox;

  if (!published) {
    return null;
  }

  const normalizedSlug = asPlainText(slug);
  const normalizedTitle = asPlainText(title);

  if (!normalizedSlug || !normalizedTitle) {
    return null;
  }

  return {
    slug: normalizedSlug,
    title: normalizedTitle,
    excerpt: asPlainText(excerpt),
    content: [],
    tag: tag?.name ?? "blog",
    author: asPlainText(author) || "BugLens",
    publishedAt: publishedAt?.start ?? new Date().toISOString(),
    updatedAt: updatedAt?.start ?? publishedAt?.start ?? new Date().toISOString(),
    readTime: asPlainText(readTime) || "5 min read",
    seoTitle: asPlainText(seoTitle) || undefined,
    seoDescription: asPlainText(seoDescription) || undefined,
  };
}

async function fetchNotionPosts(): Promise<BlogPost[]> {
  if (!isNotionConfigured()) {
    return fallbackPosts;
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${notionConfig.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionConfig.token}`,
        "Content-Type": "application/json",
        "Notion-Version": notionConfig.version,
      },
      body: JSON.stringify({
        filter: {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        sorts: [
          {
            property: "PublishedAt",
            direction: "descending",
          },
        ],
      }),
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch posts from Notion: ${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Record<string, unknown>[];
  };

  const posts =
    payload.results?.map(mapNotionPost).filter((post): post is BlogPost => Boolean(post)) ??
    [];

  return posts.length > 0 ? posts : fallbackPosts;
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
