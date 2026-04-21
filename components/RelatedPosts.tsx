import Link from "next/link";
import { BlogPost } from "@/lib/blog";

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="related-section" aria-labelledby="related-title">
      <h2 id="related-title" className="related-title">More from the blog</h2>
      <div className="blog-grid related-grid">
        {posts.map((post) => (
          <article key={post.slug} className="blog-card">
            <span className="blog-tag">{post.tag}</span>
            <h3 className="blog-title">
              <Link className="blog-title-link" href={`/blog/${post.slug}/`}>{post.title}</Link>
            </h3>
            <div className="blog-meta">
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
  );
}
