import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location } from "@/hooks/useLocations";

interface OverviewMapProps {
  locations: Array<Location & { slug: string }>;
  height?: number;
}

const createHeartPinElement = () => {
  const el = document.createElement("div");
  el.style.width = "34px";
  el.style.height = "34px";
  el.style.borderRadius = "50%";
  el.style.background = "#FFFFFF";
  el.style.border = "2px solid #D5677B";
  el.style.boxShadow = "0 1px 0 rgba(20,16,12,.04), 0 8px 24px -16px rgba(20,16,12,.10)";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.cursor = "pointer";
  el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#D5677B" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.6-9.6-9.4C.7 7.4 3.3 3 7.6 3c2.1 0 3.6 1 4.4 2.3C12.8 4 14.3 3 16.4 3c4.3 0 6.9 4.4 5.2 8.6C19.5 16.4 12 21 12 21z"/></svg>`;
  return el;
};

export const OverviewMap = ({ locations }: OverviewMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [{ id: "carto-light-layer", type: "raster", source: "carto-light" }],
      },
      center: [4.480469, 51.028022],
      zoom: 12,
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const render = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (!locations.length) return;

      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => {
        const el = createHeartPinElement();
        const popupHtml = `
          <div style="font-family: 'Fraunces', serif; font-size: 18px; line-height: 1.2; color: #15110E; margin-bottom: 6px;">${loc.name}</div>
          <a href="/locaties/${loc.slug}" style="color: #D5677B; text-decoration: underline; font-size: 13px;">Bekijk plek →</a>
        `;
        const popup = new mapboxgl.Popup({ offset: 22, closeButton: false }).setHTML(popupHtml);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);
        bounds.extend([loc.longitude, loc.latitude]);
      });

      if (locations.length === 1) {
        map.flyTo({ center: [locations[0].longitude, locations[0].latitude], zoom: 14 });
      } else {
        map.fitBounds(bounds, { padding: 48, duration: 600, maxZoom: 15 });
      }
    };

    if (map.loaded()) render();
    else map.once("load", render);
  }, [locations]);

  return <div ref={containerRef} className="w-full h-full" />;
};
