import { Button } from "@/components/ui/button";
import { Search, Upload, Heart, ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 maasai-pattern opacity-10" />
      
      {/* Decorative Circles */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary-foreground/10 blur-2xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-accent/20 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          {/* Emoji/Icon */}
          <div className="text-6xl mb-6">🇰🇪</div>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Ready to Help or Get Help?
          </h2>
          
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you've lost your ID or found someone else's, you're in the right place. 
            <span className="font-semibold"> Pamoja, tunaweza!</span> (Together, we can!)
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="glass" 
              size="xl" 
              className="w-full sm:w-auto bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30"
            >
              <Search className="w-5 h-5 mr-2" />
              Find My ID
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="accent" 
              size="xl" 
              className="w-full sm:w-auto"
            >
              <Upload className="w-5 h-5 mr-2" />
              Report Found ID
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-sm opacity-80">
            <Heart className="w-4 h-4" />
            <span>Helping Kenyans reunite with their IDs</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
