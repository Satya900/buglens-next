import type { SVGProps } from "react";

export default function BugLensMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
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
  );
}
