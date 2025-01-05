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
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Default coordinates for Mechelen
  const defaultLng = 4.480469;
  const defaultLat = 51.028022;

  // Convert the GeoJSON coordinates to a mutable object
  const boundary = JSON.parse(JSON.stringify(mechelenBoundary));
  const polygon = turf.polygon(boundary.features[0].geometry.coordinates);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [defaultLng, defaultLat],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18
    });

    map.current = newMap;

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

      // Create initial marker
      const point = turf.point([defaultLng, defaultLat]);
      if (turf.booleanPointInPolygon(point, polygon)) {
        marker.current = new mapboxgl.Marker({
          draggable: true
        })
          .setLngLat([defaultLng, defaultLat])
          .addTo(newMap);

        // Handle marker drag end
        marker.current.on('dragend', () => {
          const lngLat = marker.current!.getLngLat();
          const draggedPoint = turf.point([lngLat.lng, lngLat.lat]);
          
          if (turf.booleanPointInPolygon(draggedPoint, polygon)) {
            onLocationSelect(lngLat.lat, lngLat.lng);
            toast.success("Locatie bijgewerkt!");
          } else {
            // Reset marker to previous position if outside boundary
            marker.current!.setLngLat([defaultLng, defaultLat]);
            toast.error("Selecteer een locatie binnen Mechelen");
          }
        });

        // Trigger initial location select
        onLocationSelect(defaultLat, defaultLng);
      }
    });

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      if (marker.current) {
        marker.current.remove();
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