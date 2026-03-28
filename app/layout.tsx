import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BugLens - Your AI senior reviewer never sleeps",
  description:
    "BugLens reviews every pull request before your team does - catching bugs, vulnerabilities, and style violations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
