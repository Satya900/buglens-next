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
