import { Upload, Search, Shield, MapPin } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Report a found ID",
    description: "Snap a photo. Our OCR auto-reads the name and ID number — zero typing needed. Takes about 3 minutes.",
    step: "01"
  },
  {
    icon: Search,
    title: "Search securely",
    description: "Enter your ID number or name. We search across all reported IDs and match you instantly. Your data stays private.",
    step: "02"
  },
  {
    icon: Shield,
    title: "Verify ownership",
    description: "Answer a simple security question only the real owner would know. We connect you only after verification passes.",
    step: "03"
  },
  {
    icon: MapPin,
    title: "Collect your ID",
    description: "Pick up from a verified location — police station, bank branch, or community center. Safe handoff guaranteed.",
    step: "04"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left — sticky heading */}
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Four steps. No bureaucracy.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We built ID Mkononi to be faster than visiting Huduma Centre. 
              No queues, no paperwork, no fees.
            </p>
          </div>

          {/* Right — steps */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 py-6 border-b border-border last:border-b-0 group">
                  <div className="shrink-0 w-10 h-10 bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
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

export default HowItWorks;
