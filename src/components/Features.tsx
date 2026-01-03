import { 
  Camera, 
  MapPin, 
  Lock, 
  Gift, 
  Bell, 
  MessageCircle, 
  Shield, 
  Lightbulb,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI-Powered Scanning",
    description: "Snap a photo and our OCR technology auto-reads ID details instantly. No typing errors.",
    badge: "Smart"
  },
  {
    icon: MapPin,
    title: "Geo-Tagged Discovery",
    description: "See heatmaps of common lost/found zones. Privacy-safe location tags help narrow search.",
    badge: "Location"
  },
  {
    icon: Lock,
    title: "Digital Safe Locker",
    description: "Store an encrypted backup of your ID. Peace of mind before you even lose it.",
    badge: "Security"
  },
  {
    icon: Gift,
    title: "Kindness Rewards",
    description: "Earn credits for helping others. Redeem for airtime, discounts, or digital badges.",
    badge: "Rewards"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified instantly when an ID matching your details is posted. Real-time updates.",
    badge: "Alerts"
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Tell our chatbot where you lost your ID. It guides you through recovery step-by-step.",
    badge: "AI"
  },
  {
    icon: Shield,
    title: "Verified Finders",
    description: "Badges for trusted community members — police officers, bank staff, community leaders.",
    badge: "Trust"
  },
  {
    icon: Lightbulb,
    title: "Prevention Tips",
    description: "In-app guidance like keeping digital backups and marking wallets with contact info.",
    badge: "Learn"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            Powerful Features
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Built for Kenya, <span className="text-gradient-sunset">By Kenyans</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature is designed with your safety and convenience in mind. 
            Modern technology meets community spirit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge */}
              <span className="inline-block px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium mb-4">
                {feature.badge}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
