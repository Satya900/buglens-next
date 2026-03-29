import type { ReactNode } from "react";
import BlogNavbar from "@/components/BlogNavbar";

type BlogLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      <BlogNavbar />
      {children}
    </>
  );
}
