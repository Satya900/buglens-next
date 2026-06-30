import type { ReactNode } from "react";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

type BlogLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      {children}
      <Newsletter />
      <Footer />
    </>
  );
}
