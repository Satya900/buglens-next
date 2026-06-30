import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Terminal from "@/components/Terminal";
import PRDemoSection from "@/components/PRDemoSection";
import PainSection from "@/components/PainSection";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import KnowledgeBaseSection from "@/components/KnowledgeBaseSection";
import Pricing from "@/components/Pricing";
import Security from "@/components/Security";
import { siteConfig } from "@/lib/site";

const Blog       = dynamic(() => import("@/components/Blog"));
const Newsletter = dynamic(() => import("@/components/Newsletter"));
const ClosingCTA = dynamic(() => import("@/components/ClosingCTA"));

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    author: { "@type": "Person", name: siteConfig.creator },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/BUGLENS_Llogo.png` },
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/OnlineOnly" },
  };

  return (
    <main>
      <Hero />
      <Terminal />
      <PRDemoSection />
      <PainSection />
      <Features />
      <HowItWorks />
      <KnowledgeBaseSection />
      <Pricing />
      <Security />
      <Blog />
      <Newsletter />
      <ClosingCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
