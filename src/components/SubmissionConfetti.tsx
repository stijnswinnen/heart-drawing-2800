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
    // Set a small delay to ensure the component is mounted
    const initialTimer = setTimeout(() => {
      console.log("Testing confetti effect...");
      setTestActive(true);
      
      // Keep the animation visible for 2 seconds
      const cleanupTimer = setTimeout(() => {
        setTestActive(false);
      }, 2000);

      return () => clearTimeout(cleanupTimer);
    }, 500); // Reduced initial delay to make it more responsive

    return () => clearTimeout(initialTimer);
  }, []); // Empty dependency array to only run once on mount

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
              speed: { min: 3, max: 8 },
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: { min: 15, max: 25 },
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            gravity: {
              enable: true,
              acceleration: 2,
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
            position: { x: 50, y: 50 },
            rate: {
              delay: 0.1,
              quantity: 8,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.1,
              count: 3,
            },
          },
        ],
      }}
    />
  );
};
