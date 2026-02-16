import { Camera, MapPin, Lock, Gift, Bell, MessageCircle, Shield, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI-powered OCR scanning",
    description: "Point your camera at any Kenyan ID. Our system reads name, ID number, and details in under 5 seconds.",
    tag: "Core"
  },
  {
    icon: MapPin,
    title: "Geo-tagged discovery",
    description: "Privacy-safe location tags help narrow search results. See where IDs are commonly found across counties.",
    tag: "Core"
  },
  {
    icon: Lock,
    title: "Encrypted ID backup",
    description: "Store a digital copy of your ID before you lose it. AES-256 encrypted. Only you can access it.",
    tag: "Security"
  },
  {
    icon: Gift,
    title: "Kindness credits",
    description: "Earn redeemable credits for every ID you help return. Redeem for M-Pesa, airtime, or digital badges.",
    tag: "Rewards"
  },
  {
    icon: Bell,
    title: "Instant match alerts",
    description: "Get notified the moment someone reports an ID matching your details. SMS, email, or push notification.",
    tag: "Alerts"
  },
  {
    icon: MessageCircle,
    title: "Recovery assistant",
    description: "Tell our assistant where and when you lost your ID. It searches, matches, and guides you step by step.",
    tag: "AI"
  },
  {
    icon: Shield,
    title: "Verified finders network",
    description: "Trust badges for police officers, bank staff, and community leaders. Know who's handling your ID.",
    tag: "Trust"
  },
  {
    icon: Lightbulb,
    title: "Prevention guidance",
    description: "Practical tips: digital backups, wallet marking, emergency contacts. Prevent the next loss before it happens.",
    tag: "Learn"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 grain">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Capabilities
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Built for Kenya. Every feature earns its place.
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            No filler features. Every capability solves a real problem Kenyans face when dealing with lost IDs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background p-5 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <feature.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {feature.tag}
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
