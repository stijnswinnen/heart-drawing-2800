import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";

interface SubmissionConfettiProps {
  isActive: boolean;
}

export const SubmissionConfetti = ({ isActive }: SubmissionConfettiProps) => {
  const [testActive, setTestActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Testing confetti effect...");
      setTestActive(true);
      
      setTimeout(() => {
        setTestActive(false);
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  if (!isActive && !testActive) return null;

  return (
    <Particles
      id="submission-confetti"
      init={particlesInit}
      options={{
        particles: {
          number: {
            value: 0,
          },
          color: {
            value: ["#FFDEE2", "#F6F6F7", "#ff0000", "#ff69b4", "#ffc0cb"],
          },
          shape: {
            type: ["circle", "square", "heart"],
            options: {
              heart: {
                particles: {
                  color: {
                    value: ["#ff0000", "#ff69b4", "#ffc0cb"],
                  },
                },
              },
            },
          },
          opacity: {
            value: { min: 0.3, max: 0.8 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0,
              sync: false,
            },
          },
          size: {
            value: { min: 3, max: 7 },
            random: {
              enable: true,
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: { min: 2, max: 8 },
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: { min: 5, max: 15 },
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 0.8,
            },
            trail: {
              enable: true,
              length: 3,
              fillColor: "#000000",
            },
          },
          wobble: {
            enable: true,
            distance: 10,
            speed: { min: 2, max: 5 },
          },
        },
        fullScreen: {
          enable: true,
          zIndex: 999,
        },
        emitters: [
          {
            direction: "top",
            position: { x: 25, y: 100 },
            rate: {
              delay: 0.1,
              quantity: 5,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.3,
              count: 1,
            },
          },
          {
            direction: "top",
            position: { x: 75, y: 100 },
            rate: {
              delay: 0.1,
              quantity: 5,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.3,
              count: 1,
            },
          },
        ],
      }}
    />
  );
};