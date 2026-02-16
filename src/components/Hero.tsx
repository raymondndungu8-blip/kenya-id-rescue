import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Upload, ArrowRight } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-14 grain">
      {/* Maasai-inspired top border */}
      <div className="maasai-border" />

      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left column — editorial headline */}
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              Kenya's ID Recovery Platform
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-[1.1]">
              12,000+ National IDs returned to their owners.
              <span className="block text-primary mt-2">Yours could be next.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Don't worry — hakuna wasiwasi. ID Mkononi connects Kenyans who've lost 
              their National IDs with the people who found them. Search by ID number, 
              name, or location. Verified. Secure. Free.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate('/search')}>
                <Search className="w-4 h-4" />
                Search for my ID
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/report-found')}>
                <Upload className="w-4 h-4" />
                I found someone's ID
              </Button>
            </div>
          </div>

          {/* Right column — proof stats */}
          <div className="lg:col-span-5">
            <div className="border border-border bg-card p-6 kenyan-stripe">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                Platform Statistics
              </p>

              <div className="space-y-6">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">12,847</p>
                  <p className="text-sm text-muted-foreground">IDs successfully returned to owners</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-display text-3xl font-bold text-foreground">5,250+</p>
                  <p className="text-sm text-muted-foreground">Verified collection points across 47 counties</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-display text-3xl font-bold text-foreground">3 min</p>
                  <p className="text-sm text-muted-foreground">Average time to scan and report a found ID</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-display text-3xl font-bold text-secondary">98.2%</p>
                  <p className="text-sm text-muted-foreground">Verification success rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
