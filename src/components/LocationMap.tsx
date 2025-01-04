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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.4699, 51.9244], // Default center on Antwerp
      zoom: 11
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
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
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default LocationMap;