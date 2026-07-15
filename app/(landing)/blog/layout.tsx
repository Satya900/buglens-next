import type { ReactNode } from "react";
import Newsletter from "@/components/Newsletter";

type BlogLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      {children}
      <Newsletter />
    </>
  );
}
