import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";
import * as turf from '@turf/turf';
import { mechelenBoundary } from '../data/mechelen-boundary';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  // Convert the GeoJSON coordinates to a mutable object
  const boundary = JSON.parse(JSON.stringify(mechelenBoundary));
  const polygon = turf.polygon(boundary.features[0].geometry.coordinates);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.480, 51.028], // Center on Mechelen
      zoom: 12,
      minZoom: 11,
      maxZoom: 18
    });

    newMap.on('load', () => {
      // Add the boundary layer
      newMap.addSource('mechelen-boundary', {
        type: 'geojson',
        data: boundary
      });

      // Add fill layer
      newMap.addLayer({
        id: 'mechelen-fill',
        type: 'fill',
        source: 'mechelen-boundary',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.1
        }
      });

      // Add line layer
      newMap.addLayer({
        id: 'mechelen-line',
        type: 'line',
        source: 'mechelen-boundary',
        paint: {
          'line-color': '#0080ff',
          'line-width': 2
        }
      });
    });

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      const point = turf.point([lng, lat]);
      if (!turf.booleanPointInPolygon(point, polygon)) {
        toast.error("Selecteer een locatie binnen Mechelen");
        return;
      }

      // Remove existing marker if any
      if (marker) {
        marker.remove();
      }

      // Add new marker
      const newMarker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(newMap);

      setMarker(newMarker);
      onLocationSelect(lat, lng);
      toast.success("Locatie geselecteerd!");
    };

    newMap.on('click', handleMapClick);
    setMap(newMap);

    // Cleanup function
    return () => {
      if (marker) {
        marker.remove();
      }
      newMap.remove();
    };
  }, []);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default LocationMap;