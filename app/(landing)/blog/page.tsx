import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog";
import BlogGrid from "@/components/BlogGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Engineering notes from building BugLens, covering AI code review, retrieval systems, security analysis, and product architecture.",
  alternates: {
    canonical: "/blog/",
  },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="blog-page">
      <section className="blog-container blog-shell">
        <div className="bl-hero">
          <div className="bl-hero-left">
            <span className="section-eyebrow">{"// journal"}</span>
            <h1 className="bl-hero-title">BugLens <em>Journal</em></h1>
          </div>
          <p className="bl-hero-desc">
            Engineering notes on AI code review, agentic systems,
            and the infrastructure behind BugLens.
          </p>
        </div>

        <BlogGrid posts={posts} />
      </section>
    </main>
  );
}
