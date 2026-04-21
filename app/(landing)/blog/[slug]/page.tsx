import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, slugify } from "@/lib/blog";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import TableOfContents from "@/components/TableOfContents";
import AuthorBox from "@/components/AuthorBox";
import RelatedPosts from "@/components/RelatedPosts";
import BlogCTA from "@/components/BlogCTA";


type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Heading = {
  text: string;
  level: number;
  id: string;
};

const IconPublishedBy = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

function renderPostBlocks(post: Awaited<ReturnType<typeof getPostBySlug>>) {
  if (!post) {
    return null;
  }

  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < post.content.length) {
    const block = post.content[index];

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const isNumbered = block.type === "numbered_list_item";
      const items: string[] = [];

      while (index < post.content.length) {
        const current = post.content[index];
        if (current.type !== block.type) {
          break;
        }
        items.push(current.text);
        index += 1;
      }

      const ListTag = isNumbered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`${block.type}-${index}`}
          className={`post-list${isNumbered ? " post-list-numbered" : ""}`}
        >
          {items.map((item, itemIndex) => (
            <li key={`${block.type}-item-${itemIndex}`}>{item}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    switch (block.type) {
      case "paragraph":
        blocks.push(<p key={`${block.type}-${index}`}>{block.text}</p>);
        break;
      case "heading_2":
        blocks.push(
          <h2 id={block.id} key={`${block.type}-${index}`}>
            {block.text}
          </h2>
        );
        break;
      case "heading_3":
        blocks.push(
          <h3 id={block.id} key={`${block.type}-${index}`}>
            {block.text}
          </h3>
        );
        break;
      case "quote":
        blocks.push(
          <blockquote key={`${block.type}-${index}`}>{block.text}</blockquote>
        );
        break;
      case "callout":
        blocks.push(
          <aside key={`${block.type}-${index}`} className="post-callout">
            {block.text}
          </aside>
        );
        break;
      case "code":
        blocks.push(
          <pre key={`${block.type}-${index}`} className="post-code">
            <code>{block.text}</code>
          </pre>
        );
        break;
      case "image":
        blocks.push(
          <figure key={`${block.type}-${index}`} className="post-figure">
            <Image
              src={block.url}
              alt={block.caption ?? post.title}
              width={1600}
              height={900}
              unoptimized
            />
            {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          </figure>
        );
        break;
      case "divider":
        blocks.push(
          <hr key={`${block.type}-${index}`} className="post-divider" />
        );
        break;
      default:
        break;
    }

    index += 1;
  }

  return blocks;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const canonical = `/blog/${post.slug}/`;
  const image = post.coverImageForMetadata ?? `/blog/${post.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: [post.tag],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const headings: Heading[] = post.content
    .filter((b) => b.type === "heading_2" || b.type === "heading_3")
    .map((b) => ({
      text: "text" in b ? b.text : "",
      level: b.type === "heading_2" ? 2 : 3,
      id: b.id, // Use the unique block ID from Notion
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: getAbsoluteUrl(`/blog/${post.slug}`),
    keywords: [post.tag],
    image: post.coverImageForMetadata ?? getAbsoluteUrl(`/blog/${post.slug}/opengraph-image`),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteConfig.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <main className="blog-page">
      <div className="blog-container post-shell">
        <article className="post-article">
          <header className="post-header">
            <div className="post-kicker-row">
              <span className="blog-tag">{post.tag}</span>
              <div className="post-meta-fancy">
                <div className="post-meta-item">
                  <IconPublishedBy />
                  <div className="post-meta-text">
                    <span className="post-meta-label">Published By</span>
                    <span className="post-meta-value">{post.author}</span>
                  </div>
                </div>
                <div className="post-meta-item">
                  <IconCalendar />
                  <div className="post-meta-text">
                    <span className="post-meta-label">Published On</span>
                    <time dateTime={post.publishedAt} className="post-meta-value">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
                <div className="post-meta-item">
                  <IconClock />
                  <div className="post-meta-text">
                    <span className="post-meta-label">Reading Time</span>
                    <span className="post-meta-value">{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="post-title">{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
          </header>

          {post.coverImage ? (
            <div className="post-cover-wrap">
              <Image
                className="post-cover"
                src={post.coverImage}
                alt={post.title}
                width={1600}
                height={900}
                unoptimized
                priority
              />
            </div>
          ) : null}

          <div className="post-content-layout">
            <div className="post-content-main">
              <div className="post-body">{renderPostBlocks(post)}</div>
              <BlogCTA />
              <AuthorBox name={post.author} />
            </div>
            <aside className="post-sidebar">
              <div className="sticky-sidebar">
                <TableOfContents headings={headings} />
                <div className="sidebar-cta">
                  <h3 className="sidebar-cta-title">Ship better code</h3>
                  <p className="sidebar-cta-desc">BugLens reviews every PR before your team does. Free to start — no config needed.</p>
                  <Link href="/login" className="sidebar-cta-btn">Start for Free</Link>
                </div>
              </div>
            </aside>
          </div>
        </article>

        <RelatedPosts posts={relatedPosts} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}
