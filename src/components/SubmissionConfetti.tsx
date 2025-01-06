import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { loadHeartShape } from "tsparticles-shape-heart";

interface SubmissionConfettiProps {
  isActive: boolean;
}

export const SubmissionConfetti = ({ isActive }: SubmissionConfettiProps) => {
  const [testActive, setTestActive] = useState(false);

  // Temporary test trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Testing confetti effect...");
      setTestActive(true);
      
      // Reset after animation duration
      setTimeout(() => {
        setTestActive(false);
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadHeartShape(engine);
  }, []);

  if (!isActive && !testActive) return null;

  return (
    <Particles
      id="submission-confetti"
      init={particlesInit}
      options={{
        particles: {
          number: {
            value: 100,
          },
          color: {
            value: ["#FFDEE2", "#F6F6F7", "#ff0000", "#ff69b4", "#ffc0cb"],
          },
          shape: {
            type: "heart",
          },
          opacity: {
            value: 0.6,
            animation: {
              enable: true,
              speed: 0.3,
              minimumValue: 0,
              sync: false,
            },
          },
          size: {
            value: 6,
            random: {
              enable: true,
              minimumValue: 3,
            },
          },
          move: {
            enable: true,
            speed: 10,
            direction: "top",
            random: false,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 20,
            },
          },
        },
        fullScreen: {
          enable: true,
          zIndex: 999,
        },
        emitters: {
          direction: "top",
          position: {
            x: 50,
            y: 100,
          },
          rate: {
            delay: 0,
            quantity: 100,
          },
          size: {
            width: 100,
            height: 0,
          },
          life: {
            duration: 0.3,
            count: 1,
          },
        },
      }}
    />
  );
};