import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Download,
  Sparkles,
} from "lucide-react";

const IDECheckSection = () => {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  const scrollToBoard = () => {
    document.getElementById("board")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="ide-check" className="py-24 arduino-gradient relative overflow-hidden">
      <div className="absolute top-12 left-8 w-40 h-40 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-10 w-48 h-48 rounded-full bg-amber-200/15 blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-arduino uppercase tracking-[0.2em] mb-4">
            Step 1
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Before We Begin
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            The Arduino IDE is the software you use to write and upload code
            to your board. Make sure it is installed first.
          </p>

          <div className="bg-card/95 border border-border rounded-3xl p-6 md:p-8 card-shadow backdrop-blur-sm">
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <Sparkles size={13} />
                Quick setup check
              </span>
            </div>

            <p className="text-lg font-semibold text-foreground mb-6">
              Did you download the Arduino IDE?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setAnswer("yes")}
                type="button"
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border inline-flex items-center justify-center gap-2 ${
                  answer === "yes"
                    ? "bg-arduino text-primary-foreground border-arduino shadow-md shadow-arduino/20"
                    : "border-border text-muted-foreground hover:border-arduino/40 hover:text-arduino bg-background"
                }`}
              >
                <CheckCircle2 size={16} />
                Yes, Installed
              </button>

              <button
                onClick={() => setAnswer("no")}
                type="button"
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border inline-flex items-center justify-center gap-2 ${
                  answer === "no"
                    ? "bg-amber-50 text-amber-700 border-amber-300 shadow-md shadow-amber-200/30"
                    : "border-border text-muted-foreground hover:border-amber-300 hover:text-amber-700 bg-background"
                }`}
              >
                <Download size={16} />
                No, Need Download
              </button>
            </div>

            {answer === "yes" && (
              <div className="animate-fade-in mt-2">
                <div className="flex items-center gap-3 bg-secondary border border-arduino/20 rounded-xl px-5 py-4 mb-4">
                  <CheckCircle2 size={20} className="text-arduino shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">
                      You are all set.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Continue to learn about your Arduino board.
                    </p>
                  </div>
                </div>

                <button
                  onClick={scrollToBoard}
                  type="button"
                  className="inline-flex items-center gap-2 bg-arduino text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-arduino/90 transition-all duration-200 hover:shadow-md hover:shadow-arduino/20 text-sm"
                >
                  Next: Board Overview
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {answer === "no" && (
              <div className="animate-fade-in mt-2">
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-4">
                  <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">
                      Download Arduino IDE first
                    </p>
                    <p className="text-slate-600 text-sm mt-0.5">
                      Install the official IDE and then come back to continue the setup.
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.arduino.cc/en/software"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-arduino text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-arduino/90 transition-all duration-200 hover:shadow-md hover:shadow-arduino/20 text-sm"
                >
                  Download Arduino IDE
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IDECheckSection;
