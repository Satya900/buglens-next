import type { MetadataRoute } from "next";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/opengraph-image/",
        "/opengraph-image/",
        "/*/twitter-image/",
        "/twitter-image/",
        "/*/icon/",
        "/icon/",
        "/*/apple-icon/",
        "/apple-icon/",
        "/manifest/",
      ],
    },
    host: siteConfig.url,
    sitemap: getAbsoluteUrl("/sitemap.xml"),
  };
}
