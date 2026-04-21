import Hero from "@/components/Hero";
import Terminal from "@/components/Terminal";
import ReviewPreview from "@/components/ReviewPreview";
import Features from "@/components/Features";
import KnowledgeBaseSection from "@/components/KnowledgeBaseSection";
import Pricing from "@/components/Pricing";
import Blog from "@/components/Blog";
import Newsletter from "@/components/Newsletter";
import { siteConfig } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    author: {
      "@type": "Person",
      name: siteConfig.creator,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/BUGLENS_Llogo.png`,
      },
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
    },
  };

  return (
    <main>
      <Hero />
      <Terminal />
      <ReviewPreview />
      <Features />
      <KnowledgeBaseSection />
      <Pricing />
      <Blog />
      <Newsletter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
