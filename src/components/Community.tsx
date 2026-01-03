import { Trophy, Star, Heart, Medal, Crown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const leaderboard = [
  {
    rank: 1,
    name: "Wanjiku M.",
    county: "Nairobi",
    idsReturned: 47,
    badge: "Gold Helper",
    avatar: "WM",
    icon: Crown
  },
  {
    rank: 2,
    name: "Ochieng K.",
    county: "Kisumu",
    idsReturned: 38,
    badge: "Silver Helper",
    avatar: "OK",
    icon: Medal
  },
  {
    rank: 3,
    name: "Fatuma A.",
    county: "Mombasa",
    idsReturned: 31,
    badge: "Bronze Helper",
    avatar: "FA",
    icon: Award
  },
  {
    rank: 4,
    name: "Kamau J.",
    county: "Nakuru",
    idsReturned: 28,
    badge: "Community Star",
    avatar: "KJ",
    icon: Star
  },
  {
    rank: 5,
    name: "Aisha N.",
    county: "Eldoret",
    idsReturned: 24,
    badge: "Rising Hero",
    avatar: "AN",
    icon: Heart
  }
];

const Community = () => {
  return (
    <section id="community" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
              <Trophy className="w-4 h-4" />
              Hall of Kindness
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Our Community <span className="text-gradient-sunset">Heroes</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Meet the incredible Kenyans who go above and beyond to help others recover their IDs. 
              Every return earns Kindness Credits — redeemable for real rewards.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <p className="font-display text-3xl font-bold text-primary">8,500+</p>
                <p className="text-sm text-muted-foreground">Active Helpers</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <p className="font-display text-3xl font-bold text-accent">250K</p>
                <p className="text-sm text-muted-foreground">Kindness Credits Earned</p>
              </div>
            </div>

            <Button variant="kenyan" size="lg">
              <Heart className="w-5 h-5 mr-2" />
              Join Our Community
            </Button>
          </div>

          {/* Right - Leaderboard */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-foreground">Top Helpers This Month</h3>
              <Trophy className="w-6 h-6 text-accent" />
            </div>

            <div className="space-y-4">
              {leaderboard.map((helper, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-muted/50 ${
                    index === 0 ? 'bg-accent/10 border border-accent/20' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-accent text-accent-foreground' :
                    index === 1 ? 'bg-muted-foreground/20 text-foreground' :
                    index === 2 ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {helper.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold">
                    {helper.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{helper.name}</p>
                      <helper.icon className={`w-4 h-4 ${
                        index === 0 ? 'text-accent' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{helper.county} • {helper.badge}</p>
                  </div>

                  {/* Count */}
                  <div className="text-right">
                    <p className="font-bold text-foreground">{helper.idsReturned}</p>
                    <p className="text-xs text-muted-foreground">IDs returned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
