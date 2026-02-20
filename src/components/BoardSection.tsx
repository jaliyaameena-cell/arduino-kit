const specs = [
  { label: "Digital I/O Pins", value: "14" },
  { label: "Analog Input Pins", value: "6" },
  { label: "Clock Speed", value: "16 MHz" },
  { label: "Flash Memory", value: "32 KB" },
  { label: "Power", value: "USB / DC Jack" },
  { label: "Operating Voltage", value: "5V" },
];

const BoardSection = () => {
  return (
    <section id="board" className="py-24 section-alt">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-arduino uppercase tracking-widest mb-4">
            Step 2
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Meet the Arduino Uno
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Your gateway to electronics. Simple, powerful, and endlessly versatile.
          </p>
        </div>

        {/* Content: image + description */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Board image */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/1280px-Arduino_Uno_-_R3.jpg"
              alt="Arduino Uno board"
              className="w-full h-auto rounded-2xl border border-arduino/20 card-shadow"
              loading="lazy"
            />
          </div>

          {/* Description */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              The Perfect Starter Board
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The <span className="text-arduino font-semibold">Arduino Uno</span> is
              the world's most popular microcontroller board for learning
              electronics. It's designed specifically for beginners - no soldering,
              no complex setup, just plug it in via USB and start programming.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              With its simple C++-based language and massive community support,
              you can go from complete beginner to building real-world projects in
              a matter of hours.
            </p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-card border border-border rounded-xl px-4 py-3 hover:border-arduino/30 transition-colors duration-200"
                >
                  <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                  <p className="text-base font-bold text-arduino">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardSection;
