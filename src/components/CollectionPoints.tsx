import { MapPin, Building2, Landmark, Users, Phone, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const collectionTypes = [
  {
    icon: Landmark,
    name: "Police Stations",
    count: "2,500+",
    description: "Official collection points across all counties"
  },
  {
    icon: Building2,
    name: "Banks & Saccos",
    count: "1,800+",
    description: "KCB, Equity, Cooperative and more"
  },
  {
    icon: Users,
    name: "Community Centers",
    count: "950+",
    description: "Chiefs' offices and local leaders"
  }
];

const nearbyPoints = [
  {
    name: "Kilimani Police Station",
    type: "Police Station",
    distance: "1.2 km",
    hours: "24/7",
    idsWaiting: 12
  },
  {
    name: "KCB Westlands Branch",
    type: "Bank",
    distance: "2.4 km",
    hours: "8AM - 4PM",
    idsWaiting: 8
  },
  {
    name: "Lavington Community Center",
    type: "Community Center",
    distance: "3.1 km",
    hours: "8AM - 6PM",
    idsWaiting: 5
  }
];

const CollectionPoints = () => {
  return (
    <section id="collection-points" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-animate">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" />
            Trusted Locations
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Collection Points <span className="text-gradient-sunset">Near You</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pick up your ID from verified, secure locations across Kenya. 
            Banks, police stations, and community centers — all part of our trusted network.
          </p>
        </div>

        {/* Collection Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 scroll-stagger">
          {collectionTypes.map((type, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-lg transition-all duration-300 text-center scroll-animate-scale"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                <type.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                {type.count}
              </h3>
              <p className="font-semibold text-foreground mb-2">{type.name}</p>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>

        {/* Map Preview & Nearby List */}
        <div className="grid lg:grid-cols-5 gap-8 scroll-animate">
          {/* Map Placeholder */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden bg-muted/50 border border-border/50 h-80 lg:h-auto relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Interactive Map</p>
                <p className="text-sm text-muted-foreground">Enable location to see nearby points</p>
                <Button variant="hero" size="sm" className="mt-4">
                  Enable Location
                </Button>
              </div>
            </div>
            
            {/* Decorative map grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </div>
          </div>

          {/* Nearby Points List */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Nearby Collection Points
            </h3>

            <div className="space-y-4">
              {nearbyPoints.map((point, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {point.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{point.type}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {point.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {point.hours}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      {point.idsWaiting} IDs waiting
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Phone className="w-4 h-4 mr-2" />
              Call Nearest Point
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionPoints;
