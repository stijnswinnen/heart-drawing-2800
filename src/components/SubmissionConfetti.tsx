import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

interface SubmissionConfettiProps {
  isActive: boolean;
}

export const SubmissionConfetti = ({ isActive }: SubmissionConfettiProps) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!isActive) return null;

  return (
    <Particles
      id="submission-confetti"
      init={particlesInit}
      options={{
        particles: {
          number: {
            value: 85, // Total particles (sum of the three groups from the example)
          },
          color: {
            value: ["#FFC0CB", "#FF69B4", "#FF1493", "#C71585"],
          },
          shape: {
            type: "heart",
          },
          opacity: {
            value: 1,
          },
          size: {
            value: { min: 10, max: 30 }, // Different sizes for variety
          },
          move: {
            enable: true,
            speed: 30, // Matches startVelocity from the example
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 9.81,
            },
            decay: 0.94, // Matches decay from the example
          },
          rotate: {
            value: { min: 0, max: 360 }, // Random rotation for more natural look
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
              duration: 0.1,
              count: 1,
            },
            particles: {
              size: {
                value: 20,
              },
              move: {
                speed: 30,
              },
            },
          },
          {
            direction: "none",
            rate: {
              delay: 0.1,
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
              duration: 0.1,
              count: 1,
            },
            particles: {
              size: {
                value: 30,
              },
              move: {
                speed: 45,
              },
            },
          },
          {
            direction: "none",
            rate: {
              delay: 0.2,
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
              duration: 0.1,
              count: 1,
            },
            particles: {
              size: {
                value: 40,
              },
              move: {
                speed: 60,
              },
            },
          },
        ],
      }}
    />
  );
};