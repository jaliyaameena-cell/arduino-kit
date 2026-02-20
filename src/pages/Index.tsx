import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IDECheckSection from "@/components/IDECheckSection";
import BoardSection from "@/components/BoardSection";
import SensorSection from "@/components/SensorSection";
import ProjectSection from "@/components/ProjectSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <IDECheckSection />
        <BoardSection />
        <SensorSection onSensorsSelected={setSelectedSensors} />
        <ProjectSection selectedSensors={selectedSensors} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
