import { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { loadHeartShape } from "tsparticles-shape-heart";

interface SubmissionConfettiProps {
  isActive: boolean;
}

export const SubmissionConfetti = ({ isActive }: SubmissionConfettiProps) => {
  const [testActive, setTestActive] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      console.log("Testing confetti effect...");
      setTestActive(true);
      
      const cleanupTimer = setTimeout(() => {
        setTestActive(false);
      }, 2000);

      return () => clearTimeout(cleanupTimer);
    }, 500);

    return () => clearTimeout(initialTimer);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadHeartShape(engine);
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
            value: ["#ff0000", "#ff69b4", "#ffc0cb"],
          },
          shape: {
            type: "heart",
          },
          opacity: {
            value: { min: 0.4, max: 0.8 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0,
              sync: false,
            },
          },
          size: {
            value: { min: 4, max: 8 },
            random: {
              enable: true,
              minimumValue: 4,
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: 60,
              sync: false,
            },
          },
          tilt: {
            direction: "random",
            enable: true,
            move: true,
            value: { min: 0, max: 360 },
            animation: {
              enable: true,
              speed: 60,
            },
          },
          roll: {
            darken: {
              enable: true,
              value: 25,
            },
            enable: true,
            speed: {
              min: 15,
              max: 25,
            },
          },
          move: {
            enable: true,
            speed: { min: 10, max: 20 },
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            decay: 0.05,
            gravity: {
              enable: true,
              acceleration: 20,
            },
          },
          wobble: {
            enable: true,
            distance: 30,
            speed: { min: -12, max: 5 },
          },
        },
        fullScreen: {
          enable: true,
          zIndex: 999,
        },
        emitters: [
          {
            direction: "top",
            position: { x: 50, y: 50 },
            rate: {
              delay: 0,
              quantity: 50,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.1,
              count: 5,
            },
          },
        ],
      }}
    />
  );
};