import { useState } from "react";
import { Check, ArrowRight, Sparkles, Cpu, PlugZap } from "lucide-react";

interface Sensor {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  imageLabel?: string;
  group: "input" | "output";
}

const DHT11_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/5/51/Dht11.jpg";
const SENSOR_IMAGE_FALLBACK_URL = "/placeholder.svg";

const renderSensorImage = (src: string, alt: string) => (
  <img
    src={src}
    alt={alt}
    className="w-full h-full object-contain rounded-md"
    loading="lazy"
    onError={(event) => {
      const image = event.currentTarget;
      image.onerror = null;
      image.src = SENSOR_IMAGE_FALLBACK_URL;
    }}
  />
);

const MOISTURE_SENSOR_IMAGE_URL =
  "https://img.drz.lazcdn.com/static/np/p/cbc9d33c72719f20ea9e40e0b6e4d408.jpg_720x720q80.jpg_.webp";
const DISTANCE_SENSOR_IMAGE_URL = "/sensors/distance-sensor-hc-sr04.jpg";
const LIGHT_SENSOR_IMAGE_URL =
  "https://fluxworkshop.com/cdn/shop/products/8b7836a6-882d-4691-9532-0f4bd3b42826_300x300.jpg?v=1598564706";
const MOTION_SENSOR_IMAGE_URL =
  "https://i0.wp.com/www.datasheethub.com/wp-content/uploads/2022/10/HC-SR501-PIR-Motion-Sensor-Module.png?fit=1280%2C720&ssl=1";
const FLOW_SENSOR_IMAGE_URL = "/sensors/flow-sensor-yf-s201.jpg";
const BUZZER_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Piezo_buzzer.jpg/320px-Piezo_buzzer.jpg";
const LCD_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LCD_16x2.jpg/320px-LCD_16x2.jpg";
const RGB_LED_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/LED_RGB.jpg/320px-LED_RGB.jpg";
const RELAY_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Relay.jpg/320px-Relay.jpg";

const sensors: Sensor[] = [
  {
    id: "temp-humidity",
    name: "Humidity & Temperature Sensor",
    description: "Measures how hot/cold it is and the moisture in the air.",
    icon: renderSensorImage(DHT11_IMAGE_URL, "DHT11 humidity and temperature sensor module"),
    imageLabel: "DHT11 Sensor Module",
    group: "input",
  },
  {
    id: "moisture",
    name: "Moisture Sensor",
    description: "Detects the amount of water in soil.",
    icon: renderSensorImage(MOISTURE_SENSOR_IMAGE_URL, "FC-28 soil moisture sensor module"),
    imageLabel: "Soil Moisture Sensor",
    group: "input",
  },
  {
    id: "distance",
    name: "Distance Sensor",
    description: "Measures how far an object is from the sensor.",
    icon: renderSensorImage(DISTANCE_SENSOR_IMAGE_URL, "HC-SR04 ultrasonic distance sensor"),
    imageLabel: "Ultrasonic Distance Sensor",
    group: "input",
  },
  {
    id: "light",
    name: "Light Sensor",
    description: "Detects brightness or light intensity.",
    icon: renderSensorImage(LIGHT_SENSOR_IMAGE_URL, "LDR light dependent resistor sensor"),
    imageLabel: "Light Sensor (LDR)",
    group: "input",
  },
  {
    id: "motion",
    name: "Motion Sensor",
    description: "Detects movement in its surroundings.",
    icon: renderSensorImage(MOTION_SENSOR_IMAGE_URL, "PIR motion sensor module"),
    imageLabel: "PIR Motion Sensor",
    group: "input",
  },
  {
    id: "flow",
    name: "Flow Sensor",
    description: "Measures the flow of liquids, like water moving through a pipe.",
    icon: renderSensorImage(FLOW_SENSOR_IMAGE_URL, "YF-S201 water flow sensor"),
    imageLabel: "Water Flow Sensor",
    group: "input",
  },
  {
    id: "buzzer",
    name: "Buzzer",
    description: "Makes sound or beeps when triggered.",
    icon: renderSensorImage(BUZZER_IMAGE_URL, "Piezo buzzer"),
    imageLabel: "Buzzer Module",
    group: "output",
  },
  {
    id: "lcd",
    name: "LCD Screen",
    description: "Displays text or numbers for the user to see.",
    icon: renderSensorImage(LCD_IMAGE_URL, "16x2 LCD screen module"),
    imageLabel: "16x2 LCD Display",
    group: "output",
  },
  {
    id: "led",
    name: "Multicolor LED",
    description: "Lights up in different colors to show status or alerts.",
    icon: renderSensorImage(RGB_LED_IMAGE_URL, "RGB multicolor LED"),
    imageLabel: "RGB LED",
    group: "output",
  },
  {
    id: "relay",
    name: "Relay",
    description: "Acts like a switch to turn other devices on or off.",
    icon: renderSensorImage(RELAY_IMAGE_URL, "Relay switch module"),
    imageLabel: "Relay Module",
    group: "output",
  },
];

interface SensorCardProps {
  sensor: Sensor;
  selected: boolean;
  onToggle: () => void;
}

const SensorCard = ({ sensor, selected, onToggle }: SensorCardProps) => (
  <article
    className={`group relative bg-card rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden
      ${selected
        ? "border-arduino/60 shadow-lg shadow-arduino/20 -translate-y-0.5"
        : "border-border/80 hover:border-arduino/30 hover:-translate-y-0.5 card-shadow-hover"
      }
    `}
  >
    <div className="absolute top-3 left-3 z-10">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase border ${
          sensor.group === "input"
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
      >
        {sensor.group}
      </span>
    </div>

    {selected && (
      <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-arduino rounded-full flex items-center justify-center animate-scale-in shadow-md">
        <Check size={12} className="text-primary-foreground" strokeWidth={3} />
      </div>
    )}

    <div
      className={`aspect-[4/3] flex flex-col transition-colors duration-300 ${
        selected
          ? "bg-gradient-to-br from-arduino/10 to-cyan-50"
          : "bg-gradient-to-br from-slate-50 to-slate-100/70"
      }`}
    >
      <div
        className={`flex-1 w-full flex items-center justify-center ${
          sensor.group === "input" ? "p-2.5" : "p-4"
        }`}
      >
        <div
          className={`transition-all duration-300 ${
            selected ? "text-arduino scale-[1.02]" : "text-muted-foreground group-hover:scale-[1.02]"
          } ${sensor.group === "input" ? "w-full h-full" : ""}`}
        >
          {sensor.icon}
        </div>
      </div>
      <p className="text-xs text-muted-foreground/70 px-3 pb-3 text-center font-medium">
        {sensor.imageLabel ?? (sensor.group === "input" ? "Sensor image" : "Device icon")}
      </p>
    </div>

    <div className="p-4 md:p-5 flex flex-col flex-1">
      <h4 className="font-semibold text-foreground text-sm md:text-base mb-1.5 leading-tight">{sensor.name}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{sensor.description}</p>

      <button
        onClick={onToggle}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border
          ${selected
            ? "bg-arduino text-primary-foreground border-arduino hover:bg-arduino/90"
            : "bg-background text-muted-foreground border-border hover:border-arduino/40 hover:text-arduino"
          }
        `}
        type="button"
      >
        {selected ? "Selected" : "Select Sensor"}
      </button>
    </div>
  </article>
);

interface SensorSectionProps {
  onSensorsSelected: (sensors: string[]) => void;
}

const SensorSection = ({ onSensorsSelected }: SensorSectionProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSensor = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const inputSensors = sensors.filter((s) => s.group === "input");
  const outputDevices = sensors.filter((s) => s.group === "output");
  const selectedInputs = inputSensors.filter((s) => selected.has(s.id)).length;
  const selectedOutputs = outputDevices.filter((s) => selected.has(s.id)).length;
  const canGenerateProject = selectedInputs > 0 && selectedOutputs > 0;

  const handleLetsDoProject = () => {
    if (!canGenerateProject) {
      return;
    }

    const selectedNames = sensors.filter((s) => selected.has(s.id)).map((s) => s.name);
    onSensorsSelected(selectedNames);
    setTimeout(() => {
      document.getElementById("project")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <section id="sensors" className="py-24 arduino-gradient">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-arduino uppercase tracking-[0.2em] mb-4">Step 3</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Choose Your Sensors</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select one or more sensors you want in your project. Mix inputs and outputs freely to
            generate a more complete Arduino build.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
              <Cpu size={14} />
              Inputs selected: {selectedInputs}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <PlugZap size={14} />
              Outputs selected: {selectedOutputs}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arduino/10 border border-arduino/20 text-arduino text-xs font-semibold">
              <Sparkles size={14} />
              Total selected: {selected.size}
            </span>
          </div>
        </div>

        <div className="mb-10 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 md:p-6 card-shadow">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-sm font-bold text-arduino uppercase tracking-[0.16em] px-2">Input Sensors</h3>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
              {selectedInputs}/{inputSensors.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {inputSensors.map((sensor) => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                selected={selected.has(sensor.id)}
                onToggle={() => toggleSensor(sensor.id)}
              />
            ))}
          </div>
        </div>

        <div className="mb-12 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 md:p-6 card-shadow">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-sm font-bold text-arduino uppercase tracking-[0.16em] px-2">Output Devices</h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {selectedOutputs}/{outputDevices.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {outputDevices.map((sensor) => (
              <SensorCard
                key={sensor.id}
                sensor={sensor}
                selected={selected.has(sensor.id)}
                onToggle={() => toggleSensor(sensor.id)}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          {!canGenerateProject && (
            <p className="text-sm text-muted-foreground mb-4">
              {selectedInputs === 0 && selectedOutputs === 0
                ? "Select at least one input sensor and one output device to continue"
                : selectedInputs === 0
                  ? "Select at least one input sensor to continue"
                  : "Select at least one output device to continue"}
            </p>
          )}
          <button
            onClick={handleLetsDoProject}
            disabled={!canGenerateProject}
            className={`inline-flex items-center gap-3 font-semibold px-10 py-4 rounded-full text-base transition-all duration-300 border
              ${canGenerateProject
                ? "bg-arduino text-primary-foreground border-arduino hover:bg-arduino/90 hover:shadow-xl hover:shadow-arduino/25 hover:-translate-y-0.5 active:translate-y-0"
                : "bg-muted text-muted-foreground border-border cursor-not-allowed"
              }
            `}
            type="button"
          >
            Let's Do Project
            <ArrowRight size={18} />
          </button>
          {selected.size > 0 && (
            <p className="text-xs text-muted-foreground mt-3 animate-fade-in">
              {selected.size} sensor{selected.size > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SensorSection;
