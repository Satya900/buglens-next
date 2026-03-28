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
          color: "#22c55e",
        }}
      >
        <svg
          width="128"
          height="128"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="9"
            cy="9"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="9" cy="9" r="2" fill="currentColor" />
          <line
            x1="13"
            y1="13"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="6.5" cy="2" r="1" fill="currentColor" />
          <circle cx="11.5" cy="2" r="1" fill="currentColor" />
          <line
            x1="6.5"
            y1="3"
            x2="7.5"
            y2="5.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <line
            x1="11.5"
            y1="3"
            x2="10.5"
            y2="5.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1"
          />
        </svg>
      </div>
    ),
    size
  );
}
