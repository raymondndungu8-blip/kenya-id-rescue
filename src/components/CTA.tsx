import { Button } from "@/components/ui/button";
import { Search, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-foreground text-background grain">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-background">
              Ready to find your ID — or help someone find theirs?
            </h2>
            <p className="text-background/70 text-sm leading-relaxed max-w-lg mb-6">
              Whether you've lost your National ID or found someone else's, you're in the right place. 
              Pamoja, tunaweza — together, we can.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 group"
                onClick={() => navigate('/search')}
              >
                <Search className="w-4 h-4" />
                Find my ID
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10 hover:text-background"
                onClick={() => navigate('/report-found')}
              >
                <Upload className="w-4 h-4" />
                Report found ID
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-background/15 p-6">
              <p className="text-xs font-semibold text-background/50 uppercase tracking-widest mb-4">
                Why it matters
              </p>
              <div className="space-y-4 text-sm text-background/70">
                <p>
                  <span className="text-background font-semibold">Without a National ID,</span> Kenyans 
                  can't access banking, healthcare, voting, or employment. A lost ID means a lost livelihood.
                </p>
                <p>
                  Government replacement takes <span className="text-background font-semibold">3–6 months</span> and 
                  costs KSh 1,000+. ID Mkononi averages <span className="text-primary font-semibold">4 days</span>.
                </p>
                <p className="text-background/40 text-xs">
                  🇰🇪 Helping Kenyans reunite with their IDs since 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
