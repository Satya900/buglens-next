import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata = {
  title: 'Pricing | BugLens',
  description: 'Simple, transparent pricing for teams of all sizes.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Pricing Strategy</h1>
            <p className="text-lg text-muted-foreground">BugLens is free for public repositories and individuals. Upgrade to Starter for private repos and team context.</p>
        </div>
        <Pricing />
        
        {/* The Freemium Trigger Design Context (From Image) */}
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 text-primary-foreground/90">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="p-1 px-3 bg-primary text-primary-foreground text-xs rounded-full">Pro Tip</span>
                    High Accuracy RAG Pipeline
                </h3>
                <p className="text-sm leading-relaxed mb-4">
                    The core differentiator of the **Starter** plan is the inclusion of your team's context. 
                    Generic reviews can miss architectural nuances. Our RAG (Retrieval Augmented Generation) pipeline 
                    ingests your project documentation to ensure BugLens catches bugs specific to your codebase.
                </p>
                <div className="text-xs font-mono text-muted-foreground/80 p-3 bg-background border border-border rounded-lg">
                    "Catching the bug today that would have cost you 10 hours next week."
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
