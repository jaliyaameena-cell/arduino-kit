import { useState, useEffect } from "react";
import { Cpu } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-arduino rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <Cpu size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-arduino text-lg tracking-tight">
            Arduino<span className="text-foreground font-normal">Guide</span>
          </span>
        </button>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-8">
          {[
            { label: "Home", id: "hero" },
            { label: "Board", id: "board" },
            { label: "Sensors", id: "sensors" },
            { label: "Project", id: "project" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-muted-foreground hover:text-arduino transition-colors duration-200 font-medium"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile: minimal links */}
        <nav className="flex sm:hidden items-center gap-4">
          {[
            { label: "Board", id: "board" },
            { label: "Sensors", id: "sensors" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-xs text-muted-foreground hover:text-arduino transition-colors font-medium"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
