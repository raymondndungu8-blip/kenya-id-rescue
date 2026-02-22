import { Trophy, Heart, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  return (
    <section id="community" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center scroll-animate">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            Join Our Community
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Be a <span className="text-gradient-sunset">Community Hero</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join a growing community of Kenyans helping each other recover lost IDs. 
            Every ID you help return earns you Kindness Credits — redeemable for real rewards.
          </p>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10 scroll-stagger">
            <div className="p-6 rounded-xl bg-card border border-border/50 scroll-animate-scale">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">Get Kindness Credits for every ID you help return</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border/50 scroll-animate-scale">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Build Community</h3>
              <p className="text-sm text-muted-foreground">Connect with fellow Kenyans making a difference</p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border/50 scroll-animate-scale">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified Status</h3>
              <p className="text-sm text-muted-foreground">Become a trusted helper in your community</p>
            </div>
          </div>

          <Button variant="kenyan" size="lg">
            <Heart className="w-5 h-5 mr-2" />
            Join Our Community
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Community;
