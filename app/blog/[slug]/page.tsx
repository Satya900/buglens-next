import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
  const image = `/blog/${post.slug}/opengraph-image`;

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
  };

  return (
    <main className="blog-page">
      <article className="section post-shell">
        <span className="blog-tag">{post.tag}</span>
        <h1 className="post-title">{post.title}</h1>
        <p className="post-excerpt">{post.excerpt}</p>
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

        <div className="post-body">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
