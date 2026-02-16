import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 border-t-4 border-primary">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <a href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold">ID Mkononi</span>
            </a>
            <p className="text-background/60 text-xs leading-relaxed mb-3">
              Kenya's community-powered platform for recovering lost National IDs. 
              Free, secure, and built with trust.
            </p>
            <p className="text-xs text-background/40">🇰🇪 Made in Kenya</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-background/50">Navigate</h4>
            <ul className="space-y-2 text-xs text-background/60">
              <li><a href="#how-it-works" className="hover:text-background transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#community" className="hover:text-background transition-colors">Community</a></li>
              <li><a href="#collection-points" className="hover:text-background transition-colors">Collection Points</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-background/50">Legal</h4>
            <ul className="space-y-2 text-xs text-background/60">
              <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Data Protection</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Safety Tips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-background/50">Contact</h4>
            <ul className="space-y-2 text-xs text-background/60">
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <a href="mailto:help@idmkononi.co.ke" className="hover:text-background transition-colors">help@idmkononi.co.ke</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href="tel:+254700000000" className="hover:text-background transition-colors">+254 700 000 000</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/40">
          <p>© 2024 ID Mkononi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-background transition-colors">Twitter</a>
            <a href="#" className="hover:text-background transition-colors">Facebook</a>
            <a href="#" className="hover:text-background transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
