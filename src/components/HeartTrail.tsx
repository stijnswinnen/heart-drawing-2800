import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { loadHeartShape } from "tsparticles-shape-heart";

export const HeartTrail = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadHeartShape(engine);
    await loadFull(engine);
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
            value: 0.6,
            animation: {
              enable: true,
              minimumValue: 0,
              speed: 0.4,
              startValue: "min",
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
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: 30,
              sync: false
            }
          },
          tilt: {
            direction: "random",
            enable: true,
            move: true,
            value: { min: 0, max: 360 },
            animation: {
              enable: true,
              speed: 30
            }
          },
          move: {
            enable: true,
            speed: { min: 3, max: 5 },
            direction: "top",
            random: true,
            straight: false,
            outModes: {
              default: "out"
            },
            gravity: {
              enable: true,
              acceleration: 2
            },
            path: {
              enable: true,
              delay: {
                value: 0
              },
              options: {
                size: 10,
                draw: false,
                amplitude: 2
              }
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
              delay: 0.05,
              quantity: 5,
              pauseOnStop: false
            }
          }
        },
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        detectRetina: true
      }}
    />
  );
};