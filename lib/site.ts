export const siteConfig = {
  name: "BugLens",
  domain: "buglens.app",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://buglens.app",
  description:
    "BugLens reviews every pull request before your team does, catching bugs, vulnerabilities, and style violations with your own codebase as context.",
  creator: "Satyabrata Mohanty",
  twitterHandle: "@satyabrat_me",
  category: "technology",
  keywords: [
    "AI code review",
    "pull request review",
    "developer tools",
    "static analysis",
    "automated code review",
    "code quality",
    "software engineering",
    "LangGraph",
    "Notion CMS",
    "Next.js",
  ],
} as const;

export function getAbsoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
