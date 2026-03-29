"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface BlogGridProps {
  posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [activeTag, setActiveTag] = useState("All Posts");
  
  const tags = ["All Posts", ...Array.from(new Set(posts.map(p => p.tag)))];
  
  const filteredPosts = activeTag === "All Posts" 
    ? posts 
    : posts.filter(p => p.tag === activeTag);

  return (
    <>
      <div className="blog-filters-shell">
        <div className="blog-filters">
          {tags.map(tag => (
            <button
              key={tag}
              className={`blog-filter-btn ${activeTag === tag ? "active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-grid main-blog-grid">
        {filteredPosts.map((post) => (
          <article key={post.slug} className="blog-card blog-card-full">
            <div className="blog-card-content">
              <span className="blog-tag-mini">{post.tag}</span>
              <h2 className="blog-title">
                <Link className="blog-title-link" href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="blog-excerpt">{post.excerpt}</p>
            </div>
            
            <div className="blog-card-footer">
              <div className="blog-author-meta">
                <div className="blog-author-avatar-mini">
                  {post.author.charAt(0)}
                </div>
                <div className="blog-author-info">
                  <span className="blog-author-name">{post.author}</span>
                  <span className="blog-post-date">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <span className="blog-read-time">{post.readTime}</span>
            </div>
          </article>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <div className="blog-empty">
          <p>No posts found in this category.</p>
        </div>
      )}
    </>
  );
}
