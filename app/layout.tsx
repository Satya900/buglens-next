import type { Metadata } from "next";

import { Suspense } from "react"
import { Analytics } from '@vercel/analytics/react';
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AI Code Review for GitHub PRs | BugLens",
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
    canonical: `${siteConfig.url.replace(/\/$/, "")}/`,
  },
  openGraph: {
    type: "website",
    url: `${siteConfig.url.replace(/\/$/, "")}/`,
    title: "AI Code Review for GitHub PRs | BugLens",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: getAbsoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "BugLens - AI Senior Reviewer for Pull Requests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Code Review for GitHub PRs | BugLens",
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
    icon: "/BUGLENS_Llogo.png",
    apple: "/BUGLENS_Llogo.png",
  },

  verification: {
    google: "2hBpANs5oMr3M_eJtuQFjx-dvCrNfLzr4qka_EjwzfQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BugLens",
    operatingSystem: "GitHub",
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "19",
      priceCurrency: "USD",
    },
    description: "AI senior reviewer for GitHub PRs that catches bugs and style violations.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Analytics />

      </body>
    </html>
  );
}

