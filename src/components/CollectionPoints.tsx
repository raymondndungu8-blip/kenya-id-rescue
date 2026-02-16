import { MapPin, Building2, Landmark, Users, Phone, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const collectionTypes = [
  { icon: Landmark, name: "Police Stations", count: "2,500+", description: "Official points across all 47 counties" },
  { icon: Building2, name: "Banks & SACCOs", count: "1,800+", description: "KCB, Equity, Cooperative, and more" },
  { icon: Users, name: "Community Centers", count: "950+", description: "Chiefs' offices and local leaders" }
];

const nearbyPoints = [
  { name: "Kilimani Police Station", type: "Police Station", distance: "1.2 km", hours: "24/7", idsWaiting: 12 },
  { name: "KCB Westlands Branch", type: "Bank", distance: "2.4 km", hours: "8AM – 4PM", idsWaiting: 8 },
  { name: "Lavington Community Center", type: "Community Center", distance: "3.1 km", hours: "8AM – 6PM", idsWaiting: 5 }
];

const CollectionPoints = () => {
  return (
    <section id="collection-points" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Collection Network
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            5,250+ verified pickup points.
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Every location is vetted. Banks, police stations, and community centers — 
            pick up your ID from a place you already trust.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid md:grid-cols-3 gap-px bg-border mb-12">
          {collectionTypes.map((type, index) => (
            <div key={index} className="bg-card p-6 text-center">
              <type.icon className="w-5 h-5 text-primary mx-auto mb-3" />
              <p className="font-display text-2xl font-bold text-foreground">{type.count}</p>
              <p className="font-semibold text-foreground text-sm">{type.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
            </div>
          ))}
        </div>

        {/* Map + list */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 border border-border bg-muted/30 h-72 lg:h-auto relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />
            <div className="text-center relative z-10">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Interactive map</p>
              <p className="text-xs text-muted-foreground mb-3">Enable location to see nearby points</p>
              <Button variant="default" size="sm">
                Enable Location
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Nearby points
            </h3>

            <div className="space-y-0 border border-border divide-y divide-border">
              {nearbyPoints.map((point, index) => (
                <div key={index} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {point.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{point.type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{point.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{point.hours}</span>
                    <span className="text-primary font-semibold">{point.idsWaiting} IDs waiting</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-3" size="sm">
              <Phone className="w-4 h-4 mr-1" />
              Call nearest point
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionPoints;
