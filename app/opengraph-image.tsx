import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
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
              width="48"
              height="48"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="52,42 68,68 38,66" fill="#146B48" />
              <polygon points="148,42 132,68 162,66" fill="#146B48" />
              <ellipse cx="100" cy="118" rx="74" ry="70" fill="#1FAE72" />
              <ellipse cx="38" cy="128" rx="17" ry="36" fill="#146B48" />
              <ellipse cx="162" cy="128" rx="17" ry="36" fill="#146B48" />
              <circle cx="72" cy="102" r="34" fill="#F6F7F3" />
              <circle cx="128" cy="102" r="34" fill="#F6F7F3" />
              <circle cx="72" cy="102" r="22" fill="#12150F" />
              <circle cx="128" cy="102" r="22" fill="#12150F" />
              <circle cx="77" cy="96" r="6" fill="#F6F7F3" />
              <circle cx="133" cy="96" r="6" fill="#F6F7F3" />
              <polygon points="100,116 89,136 111,136" fill="#FF6B4E" />
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
            AI senior reviewer
          </div>
          <div
            style={{
              fontSize: "68px",
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            Catch bugs before your team does.
          </div>
          <div
            style={{
              fontSize: "30px",
              color: "#7a9980",
              maxWidth: "860px",
              lineHeight: 1.4,
            }}
          >
            BugLens reviews pull requests with codebase context, security checks,
            and structured verdicts.
          </div>
        </div>
      </div>
    ),
    size
  );
}
