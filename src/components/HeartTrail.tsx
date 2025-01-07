import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { loadHeartShape } from "tsparticles-shape-heart";

export const HeartTrail = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log("Initializing particles...");
    try {
      await loadHeartShape(engine);
      await loadFull(engine);
      console.log("Particles initialized successfully");
    } catch (error) {
      console.error("Error initializing particles:", error);
    }
  }, []);

  return (
    <Particles
      id="heart-trail"
      init={particlesInit}
      options={{
        particles: {
          number: {
            value: 0
          },
          color: {
            value: ["#FFDEE2"]
          },
          shape: {
            type: "heart"
          },
          opacity: {
            value: { min: 0.3, max: 0.8 },
            animation: {
              enable: true,
              minimumValue: 0,
              speed: 0.4,
              startValue: "max",
              destroy: "min"
            }
          },
          size: {
            value: 12,
            random: {
              enable: true,
              minimumValue: 8
            }
          },
          life: {
            duration: {
              sync: true,
              value: 1
            },
            count: 1
          },
          move: {
            enable: true,
            speed: { min: 3, max: 5 },
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "destroy"
            }
          }
        },
        interactivity: {
          detectsOn: "window",
          events: {
            onHover: {
              enable: true,
              mode: "trail"
            },
            resize: true
          },
          modes: {
            trail: {
              delay: 0.1,
              quantity: 2,
              pauseOnStop: true
            }
          }
        },
        fullScreen: {
          enable: true,
          zIndex: 1
        },
        detectRetina: true
      }}
    />
  );
};