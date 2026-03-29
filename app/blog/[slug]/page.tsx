import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
        blocks.push(<h2 key={`${block.type}-${index}`}>{block.text}</h2>);
        break;
      case "heading_3":
        blocks.push(<h3 key={`${block.type}-${index}`}>{block.text}</h3>);
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
        blocks.push(<hr key={`${block.type}-${index}`} className="post-divider" />);
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
  const canonical = `/blog/${post.slug}`;
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

  return (
    <main className="blog-page">
      <article className="section post-shell">
        <Link className="post-back-link" href="/blog">
          Back to journal
        </Link>

        <header className="post-header">
          <div className="post-kicker-row">
            <span className="blog-tag">{post.tag}</span>
            <div className="blog-meta post-meta">
              <span>{post.author}</span>
              <span className="blog-meta-dot"></span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span className="blog-meta-dot"></span>
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1 className="post-title">{post.title}</h1>
          <p className="post-excerpt">{post.excerpt}</p>
        </header>

        {post.coverImage ? (
          <div className="post-cover-wrap">
            {/* Notion-hosted file URLs are already transformed upstream when available. */}
            <Image
              className="post-cover"
              src={post.coverImage}
              alt={post.title}
              width={1600}
              height={900}
              unoptimized
              preload
            />
          </div>
        ) : null}

        <div className="post-body">{renderPostBlocks(post)}</div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
