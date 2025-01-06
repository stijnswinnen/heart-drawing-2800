import { useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { loadHeartShape } from "tsparticles-shape-heart";

interface SubmissionConfettiProps {
  isActive: boolean;
}

export const SubmissionConfetti = ({ isActive }: SubmissionConfettiProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadHeartShape(engine);
  }, []);

  // Temporary test trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Testing confetti effect...");
      // This will trigger the effect once after 1 second
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

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
            speed: 50, // Increased initial velocity
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 15, // Increased gravity
            },
            decay: 0.96, // Slightly reduced decay for longer movement
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: 30,
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
              quantity: 50,
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
              duration: 0.3, // Increased duration
              count: 1,
            },
            particles: {
              size: {
                value: 20,
              },
              move: {
                speed: 50,
              },
            },
          },
          {
            direction: "none",
            rate: {
              delay: 0.2,
              quantity: 25,
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
              duration: 0.3,
              count: 1,
            },
            particles: {
              size: {
                value: 30,
              },
              move: {
                speed: 65,
              },
            },
          },
          {
            direction: "none",
            rate: {
              delay: 0.4,
              quantity: 10,
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
              duration: 0.3,
              count: 1,
            },
            particles: {
              size: {
                value: 40,
              },
              move: {
                speed: 80,
              },
            },
          },
        ],
      }}
    />
  );
};