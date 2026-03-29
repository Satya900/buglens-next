import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type BlogPostImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OpengraphImage({ params }: BlogPostImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #060a07 0%, #0d1510 60%, #111a13 100%)",
          padding: "56px",
          color: "#e8f0e9",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#22c55e",
            fontSize: "28px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              border: "2px solid rgba(34, 197, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(26, 46, 30, 0.8)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="28"
                cy="28"
                r="14"
                stroke="#22c55e"
                strokeWidth="4"
              />
              <circle cx="28" cy="28" r="5.5" fill="#22c55e" />
              <path
                d="M39 39L52 52"
                stroke="#22c55e"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <circle cx="21" cy="9.5" r="2.5" fill="#22c55e" />
              <circle cx="35" cy="9.5" r="2.5" fill="#22c55e" />
              <path
                d="M21 12L23.5 18"
                stroke="#22c55e"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M35 12L32.5 18"
                stroke="#22c55e"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <span>buglens.app</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              color: "#22c55e",
              fontSize: "24px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {post?.tag ?? "blog"}
          </div>
          <div
            style={{
              fontSize: "64px",
              lineHeight: 1.05,
              maxWidth: "960px",
            }}
          >
            {post?.title ?? "BugLens"}
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#7a9980",
              maxWidth: "860px",
              lineHeight: 1.4,
            }}
          >
            {post?.excerpt ??
              "AI code review, engineering notes, and the architecture behind BugLens."}
          </div>
        </div>
      </div>
    ),
    size
  );
}
