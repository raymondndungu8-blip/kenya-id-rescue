import { Search, Upload, Shield, MapPin, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Report a Found ID",
    description: "Snap a photo and upload it securely. Our AI auto-reads the details — no typing needed.",
    color: "bg-primary",
    step: "01"
  },
  {
    icon: Search,
    title: "Search Securely",
    description: "Lost your ID? Search anonymously using your ID number. We'll match you with finders.",
    color: "bg-secondary",
    step: "02"
  },
  {
    icon: Shield,
    title: "Verify & Connect",
    description: "Answer simple security questions to prove ownership. Only then do we connect you.",
    color: "bg-kenyan-red",
    step: "03"
  },
  {
    icon: MapPin,
    title: "Collect Safely",
    description: "Pick up your ID from a trusted collection point — banks, police stations, or community centers.",
    color: "bg-accent",
    step: "04"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            How ID Mkononi Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to reunite you with your National ID. Our process is secure, private, and built on trust.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-card rounded-2xl p-6 h-full shadow-card hover:shadow-lg transition-all duration-300 border border-border/50 hover:-translate-y-1">
                {/* Step Number */}
                <span className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-sm">
                  {step.step}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-secondary/10 border border-secondary/20">
            <CheckCircle className="w-6 h-6 text-secondary" />
            <span className="text-foreground font-medium">
              Over 12,000 IDs successfully returned to their owners
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
