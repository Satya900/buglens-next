import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060a07",
          borderRadius: "36px",
        }}
      >
        <svg
          width="140"
          height="140"
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
    ),
    size
  );
}
