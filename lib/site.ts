export const siteConfig = {
  name: "BugLens",
  domain: "buglens.app",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://buglens.app/",
  description:
    "BugLens is an AI senior reviewer for GitHub PRs that catches bugs, vulnerabilities, and style violations before your team does.",
  creator: "Satyabrata Mohanty",
  twitterHandle: "@satyabrat_me",
  logo: "/BUGLENS_Llogo.png",
  category: "technology",
  keywords: [
    "AI Code Review",
    "GitHub PR Review AI",
    "Automated Pull Request Review",
    "AI Senior Reviewer",
    "CodeRabbit Alternative",
    "Software Quality AI",
    "Static Analysis AI",
    "Bug Detection AI",
    "Developer Productivity Tools",
    "Next.js SEO",
  ],
} as const;


export function getAbsoluteUrl(path = "/") {
  const url = new URL(path, siteConfig.url).toString();
  // Don't add trailing slash if path has an extension (like .xml, .png)
  if (path.split("/").pop()?.includes(".")) return url;
  return url.endsWith("/") ? url : `${url}/`;
}
