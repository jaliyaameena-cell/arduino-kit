import { Cpu } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-arduino rounded-md flex items-center justify-center">
              <Cpu size={14} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-arduino text-base tracking-tight">
              Arduino<span className="text-foreground font-normal">Guide</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground text-center">
            Making electronics accessible — one project at a time.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ArduinoGuide. Educational use only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
