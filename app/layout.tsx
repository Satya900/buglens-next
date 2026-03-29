import type { Metadata } from "next";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "BugLens | AI senior reviewer for pull requests",
    template: "%s | BugLens",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  category: siteConfig.category,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: "BugLens | AI senior reviewer for pull requests",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "BugLens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BugLens | AI senior reviewer for pull requests",
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [getAbsoluteUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
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
