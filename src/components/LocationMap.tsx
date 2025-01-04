import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Mechelen boundaries
  const MECHELEN_BOUNDS: [[number, number], [number, number]] = [
    [4.4400, 51.0060], // Southwest
    [4.5200, 51.0500]  // Northeast
  ];

  const isWithinMechelen = (lng: number, lat: number) => {
    return lng >= MECHELEN_BOUNDS[0][0] && 
           lng <= MECHELEN_BOUNDS[1][0] && 
           lat >= MECHELEN_BOUNDS[0][1] && 
           lat <= MECHELEN_BOUNDS[1][1];
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.4800, 51.0280], // Center on Mechelen
      zoom: 13, // Closer zoom for city level
      maxBounds: MECHELEN_BOUNDS, // Restrict panning
      minZoom: 12, // Prevent zooming out too far
      maxZoom: 18 // Allow detailed zoom
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      if (!isWithinMechelen(lng, lat)) {
        toast.error("Selecteer een locatie binnen Mechelen");
        return;
      }

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;

      onLocationSelect(lat, lng);
      toast.success("Locatie geselecteerd!");
    };

    map.on('click', handleMapClick);

    // Cleanup function
    return () => {
      map.off('click', handleMapClick);
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.remove();
    };
  }, [onLocationSelect]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full cursor-pin" />
    </div>
  );
};

export default LocationMap;