import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const scrollToIDE = () => {
    document.getElementById("ide-check")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center arduino-gradient-hero overflow-hidden pt-16"
    >
      {/* Subtle decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-arduino/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-arduino/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-arduino/10 border border-arduino/20 text-arduino rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-arduino animate-pulse" />
          Beginner Friendly · No Experience Needed
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight mb-6">
          Arduino{" "}
          <span className="text-arduino">Made Simple</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-muted-foreground font-light mb-6 tracking-wide">
          Your First Electronics Project
        </p>

        {/* Description */}
        <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed mb-12">
          Learn to build real electronics projects with the Arduino Uno — from
          setting up your development environment to wiring sensors and bringing
          your ideas to life.
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToIDE}
          className="inline-flex items-center gap-3 bg-arduino text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:bg-arduino/90 transition-all duration-200 hover:shadow-lg hover:shadow-arduino/25 hover:-translate-y-0.5 active:translate-y-0"
        >
          Get Started
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce-arrow">
        <span className="text-xs uppercase tracking-widest font-medium opacity-60">Scroll</span>
        <ChevronDown size={20} className="opacity-50" />
      </div>
    </section>
  );
};

export default HeroSection;
