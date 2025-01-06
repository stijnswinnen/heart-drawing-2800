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
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadHeartShape(engine);
  }, []);

  // Temporary test trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Testing confetti effect...");
      setTestActive(true);
      // Reset after 5 seconds
      setTimeout(() => setTestActive(false), 5000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive && !testActive) return null;

  return (
    <Particles
      id="submission-confetti"
      init={particlesInit}
      options={{
        particles: {
          number: {
            value: 85,
          },
          color: {
            value: ["#FFC0CB", "#FF69B4", "#FF1493", "#C71585"],
          },
          shape: {
            type: "heart",
          },
          opacity: {
            value: 1,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0,
              sync: false,
              destroy: "min",
            },
          },
          size: {
            value: { min: 10, max: 30 },
          },
          move: {
            enable: true,
            speed: 30,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 1,
            },
            decay: 0.94,
          },
          rotate: {
            value: { min: -45, max: 45 },
            direction: "random",
            animation: {
              enable: true,
              speed: 15,
            },
          },
        },
        fullScreen: {
          enable: true,
          zIndex: 999,
        },
        emitters: [
          {
            direction: "none",
            rate: {
              delay: 0,
              quantity: 100,
            },
            position: {
              x: 50,
              y: 50,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 5,
              count: 1,
            },
            particles: {
              startVelocity: 30,
            },
          },
        ],
      }}
    />
  );
};