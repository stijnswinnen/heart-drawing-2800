import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";
import * as turf from '@turf/turf';
import { mechelenBoundary } from '../data/mechelen-boundary';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const createHeartPinElement = () => {
  const el = document.createElement('div');
  el.style.width = '38px';
  el.style.height = '38px';
  el.style.borderRadius = '50%';
  el.style.background = '#FFFFFF';
  el.style.border = '2px solid var(--pink-500)';
  el.style.boxShadow = 'var(--shadow-soft)';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.cursor = 'grab';
  el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#D5677B" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.6-9.6-9.4C.7 7.4 3.3 3 7.6 3c2.1 0 3.6 1 4.4 2.3C12.8 4 14.3 3 16.4 3c4.3 0 6.9 4.4 5.2 8.6C19.5 16.4 12 21 12 21z"/></svg>`;
  return el;
};

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const defaultLng = 4.480469;
  const defaultLat = 51.028022;

  const boundary = JSON.parse(JSON.stringify(mechelenBoundary));
  const polygon = turf.polygon(boundary.features[0].geometry.coordinates);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-light': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          { id: 'carto-light-layer', type: 'raster', source: 'carto-light' },
        ],
      },
      center: [defaultLng, defaultLat],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
    });

    map.current = newMap;

    newMap.on('load', () => {
      newMap.addSource('mechelen-boundary', { type: 'geojson', data: boundary });
      newMap.addLayer({
        id: 'mechelen-fill',
        type: 'fill',
        source: 'mechelen-boundary',
        paint: { 'fill-color': '#D5677B', 'fill-opacity': 0.06 },
      });
      newMap.addLayer({
        id: 'mechelen-line',
        type: 'line',
        source: 'mechelen-boundary',
        paint: { 'line-color': '#D5677B', 'line-width': 1.5 },
      });

      const point = turf.point([defaultLng, defaultLat]);
      if (turf.booleanPointInPolygon(point, polygon)) {
        marker.current = new mapboxgl.Marker({
          element: createHeartPinElement(),
          draggable: true,
          anchor: 'center',
        })
          .setLngLat([defaultLng, defaultLat])
          .addTo(newMap);

        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          const draggedPoint = turf.point([lngLat.lng, lngLat.lat]);

          if (turf.booleanPointInPolygon(draggedPoint, polygon)) {
            onLocationSelect(lngLat.lat, lngLat.lng);
            toast.success("Locatie bijgewerkt!");
          } else {
            marker.current!.setLngLat([defaultLng, defaultLat]);
            toast.error("Selecteer een locatie binnen Mechelen");
          }
        });

        onLocationSelect(defaultLat, defaultLng);
      }
    });

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (marker.current) marker.current.remove();
      newMap.remove();
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default LocationMap;
