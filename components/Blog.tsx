import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";

export default async function Blog() {
  const posts = (await getPublishedPosts()).slice(0, 3);

  return (
    <>
      <section className="section" id="blog">
        <div className="section-eyebrow">{"// from the builder's log"}</div>
        <h2 className="section-title">Building in <em>public</em></h2>
        <p className="section-sub">Technical deep-dives on AI agents, RAG pipelines, and the engineering decisions behind BugLens.</p>
        <div className="bl-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="bl-card">
              <span className="bl-tag">{post.tag}</span>
              <h3 className="bl-card-title">{post.title}</h3>
              <p className="bl-card-excerpt">{post.excerpt}</p>
              <div className="bl-card-footer">
                <div className="bl-avatar bl-avatar-sm">{post.author.charAt(0)}</div>
                <span className="bl-meta-line">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="bl-dot">·</span>
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="bl-view-journal">
          <Link href="/blog/" className="btn-ghost">
            View Journal &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
