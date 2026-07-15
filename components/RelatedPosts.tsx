import Link from "next/link";
import { BlogPost } from "@/lib/blog";

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="related-section" aria-labelledby="related-title">
      <h2 id="related-title" className="related-title">More from the blog</h2>
      <div className="bl-grid related-grid">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}/`} className="bl-card">
            <span className="bl-tag">{post.tag}</span>
            <h3 className="bl-card-title">{post.title}</h3>
            <div className="bl-card-footer">
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
    </section>
  );
}
