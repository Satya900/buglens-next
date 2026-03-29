import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Engineering notes from building BugLens, covering AI code review, retrieval systems, security analysis, and product architecture.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="blog-page">
      <section className="section blog-shell">
        <div className="blog-hero">
          <div className="section-eyebrow">{"// buglens journal"}</div>
          <h1 className="section-title">
            Shipping the product in <em>public</em>
          </h1>
          <p className="section-sub blog-lead">
            Long-form notes on the technical decisions behind BugLens, from
            multi-agent architecture to code review ergonomics and security
            analysis.
          </p>

          <div className="blog-hero-stats" aria-label="Blog summary">
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-label">Posts</span>
              <strong>{posts.length}</strong>
            </div>
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-label">Topics</span>
              <strong>Architecture, RAG, security</strong>
            </div>
            <div className="blog-hero-stat">
              <span className="blog-hero-stat-label">Intent</span>
              <strong>Technical notes, not growth content</strong>
            </div>
          </div>
        </div>

        <div className="blog-list">
          {posts.map((post, index) => (
            <article key={post.slug} className="blog-list-item">
              <div className="blog-list-index">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="blog-list-content">
                <span className="blog-tag">{post.tag}</span>
                <h2 className="blog-list-title">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="blog-list-excerpt">{post.excerpt}</p>
                <div className="blog-meta">
                  <span>{post.author}</span>
                  <span className="blog-meta-dot"></span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="blog-meta-dot"></span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
