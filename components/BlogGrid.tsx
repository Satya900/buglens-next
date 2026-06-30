"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface BlogGridProps {
  posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [activeTag, setActiveTag] = useState("All Posts");

  const tags = ["All Posts", ...Array.from(new Set(posts.map((p) => p.tag)))];

  const filteredPosts =
    activeTag === "All Posts"
      ? posts
      : posts.filter((p) => p.tag === activeTag);

  const [featured, ...rest] = filteredPosts;

  return (
    <>
      {/* Filter bar */}
      <div className="bl-filters-shell">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`bl-filter-btn${activeTag === tag ? " active" : ""}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="bl-empty">No posts in this category yet.</p>
      )}

      {featured && (
        <Link href={`/blog/${featured.slug}/`} className="bl-featured">
          <div className="bl-featured-left">
            <span className="bl-tag">{featured.tag}</span>
            <h2 className="bl-featured-title">{featured.title}</h2>
            <p className="bl-featured-excerpt">{featured.excerpt}</p>
          </div>
          <div className="bl-featured-right">
            <div className="bl-author-row">
              <div className="bl-avatar">{featured.author.charAt(0)}</div>
              <div>
                <div className="bl-author-name">{featured.author}</div>
                <div className="bl-meta-line">
                  {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                  <span className="bl-dot">·</span>
                  {featured.readTime}
                </div>
              </div>
            </div>
            <div className="bl-featured-cta">Read article →</div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="bl-grid">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}/`} className="bl-card">
              <span className="bl-tag">{post.tag}</span>
              <h3 className="bl-card-title">{post.title}</h3>
              <p className="bl-card-excerpt">{post.excerpt}</p>
              <div className="bl-card-footer">
                <div className="bl-avatar bl-avatar-sm">{post.author.charAt(0)}</div>
                <span className="bl-meta-line">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                  <span className="bl-dot">·</span>
                  {post.readTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
