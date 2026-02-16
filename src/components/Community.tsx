import { Heart, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  return (
    <section id="community" className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left — message */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Community
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              4,200 Kenyans already helping each other.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Every ID returned is a life simplified. Join verified finders earning Kindness Credits 
              while making a real difference in your community.
            </p>
            <Button variant="kenyan" size="lg">
              <Heart className="w-4 h-4" />
              Join the network
            </Button>
          </div>

          {/* Right — benefits */}
          <div className="lg:col-span-7">
            <div className="grid gap-px bg-border">
              <div className="bg-background p-6 flex gap-4 kenyan-stripe">
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Earn real rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Get Kindness Credits for every ID you help return. Redeem for M-Pesa airtime, 
                    data bundles, or merchant discounts. Top finders this month earned KSh 2,400+ in credits.
                  </p>
                </div>
              </div>
              <div className="bg-background p-6 flex gap-4 kenyan-stripe">
                <Users className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Build your reputation</h3>
                  <p className="text-sm text-muted-foreground">
                    Your profile shows every ID you've helped return. Employers, community groups, 
                    and institutions see your verified track record.
                  </p>
                </div>
              </div>
              <div className="bg-background p-6 flex gap-4 kenyan-stripe">
                <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Verified finder status</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete ID verification to earn a trust badge. Police officers, bank staff, 
                    and chiefs get priority verification. 847 verified finders and growing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
