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
              borderRadius: "18px",
              border: "2px solid rgba(34, 197, 94, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(26, 46, 30, 0.8)",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "999px",
                border: "4px solid #22c55e",
                position: "relative",
              }}
            />
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
