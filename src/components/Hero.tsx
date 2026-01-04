import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Upload, Heart, ArrowRight, Shield, Users, Star } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 maasai-pattern opacity-30" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/50" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 rounded-full bg-primary/10 animate-float blur-xl" />
      <div className="absolute top-48 right-20 w-32 h-32 rounded-full bg-accent/20 animate-float animation-delay-200 blur-xl" />
      <div className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-secondary/15 animate-float animation-delay-400 blur-xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8 animate-slide-up">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Trusted by 50,000+ Kenyans</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up animation-delay-100">
            Your ID, Safely
            <span className="block text-gradient-sunset">Back in Your Hand</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
            Don't worry — we're here to help. ID Mkononi connects Kenyans who've lost their National IDs 
            with the kind souls who found them. <span className="text-foreground font-medium">Together, we bring IDs home.</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up animation-delay-300">
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              <Search className="w-5 h-5 mr-2" />
              Search for My ID
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto" onClick={() => navigate("/report-found")}>
              <Upload className="w-5 h-5 mr-2" />
              I Found an ID
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto animate-slide-up animation-delay-400">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">12K+</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">IDs Returned</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-5 h-5 text-secondary" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">50K+</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Community Members</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-accent" />
                <span className="font-display text-2xl md:text-3xl font-bold text-foreground">4.9</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Trust Rating</p>
            </div>
          </div>
        </div>

        {/* Reassurance Message */}
        <div className="mt-16 text-center animate-fade-in animation-delay-500">
          <p className="text-sm text-muted-foreground italic">
            "Hakuna wasiwasi — your ID is safe with our verified community" 🇰🇪
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
