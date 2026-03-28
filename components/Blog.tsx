import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export default async function Blog() {
  const posts = (await getPublishedPosts()).slice(0, 4);

  return (
    <>
      <div className="divider-line"></div>
      <section className="section" id="blog">
        <div className="section-eyebrow">{"// from the builder's log"}</div>
        <h2 className="section-title">Building in <em>public</em></h2>
        <p className="section-sub">Technical deep-dives on AI agents, RAG pipelines, and the engineering decisions behind BugLens.</p>
        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <span className="blog-tag">{post.tag}</span>
              <Link className="blog-title-link" href={`/blog/${post.slug}`}>
                <div className="blog-title">{post.title}</div>
              </Link>
              <div className="blog-excerpt">{post.excerpt}</div>
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
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
