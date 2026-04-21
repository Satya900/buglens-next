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
        <div className="blog-hero-refined">
          <span className="section-eyebrow">{"// journal"}</span>
          <h1 className="blog-title-main">
            BugLens <em>Journal</em>
          </h1>
          <p className="blog-desc-main">
            Deep dives into building professional code review agents — from
            agentic RAG to the security of large-scale code analysis.
          </p>
        </div>

        <BlogGrid posts={posts} />
      </section>
    </main>
  );
}
