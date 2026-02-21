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
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Kenyan Flag Background */}
      <div className="absolute inset-0">
        {/* Black stripe */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-kenyan-black" />
        {/* Red stripe with white border */}
        <div className="absolute top-1/4 left-0 right-0 h-[4%] bg-white" />
        <div className="absolute top-[29%] left-0 right-0 h-[21%] bg-kenyan-red" />
        <div className="absolute top-1/2 left-0 right-0 h-[4%] bg-white" />
        {/* Green stripe */}
        <div className="absolute top-[54%] left-0 right-0 h-[21%] bg-kenyan-green" />
        <div className="absolute top-3/4 left-0 right-0 h-1/4 bg-kenyan-green" />
      </div>
      
      {/* Maasai Shield & Spears Silhouette (centered decorative element) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-64 h-96 md:w-80 md:h-[28rem] relative">
          {/* Shield shape */}
          <div className="absolute inset-0 bg-foreground rounded-[50%] transform scale-x-75" />
          {/* Shield inner pattern */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1/2 h-1/2 border-4 border-background/30 rounded-full" />
          {/* Crossed spears */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-[140%] bg-foreground rotate-12" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-[140%] bg-foreground -rotate-12" />
        </div>
      </div>
      
      {/* Elegant overlay for readability */}
      <div className="absolute inset-0 bg-background/65 backdrop-blur-[2px]" />
      
      {/* Subtle Maasai pattern overlay */}
      <div className="absolute inset-0 maasai-pattern opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-semibold mb-4 backdrop-blur-sm">
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
              className="group p-6 rounded-2xl bg-card/95 backdrop-blur-sm border border-border/50 hover:border-primary/30 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
        
        {/* Heritage badge */}
        <div className="text-center mt-12">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">🇰🇪</span>
            Proudly Kenyan
          </span>
        </div>
      </div>
    </section>
  );
};

export default Features;
