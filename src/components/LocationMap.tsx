import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";
import * as turf from '@turf/turf';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  // Define district polygons
  const MECHELEN_DISTRICTS = {
    center: [
      [4.4650, 51.0160],
      [4.4890, 51.0160],
      [4.4890, 51.0350],
      [4.4650, 51.0350],
      [4.4650, 51.0160]
    ],
    hombeek: [
      [4.4200, 51.0150],
      [4.4500, 51.0150],
      [4.4500, 51.0350],
      [4.4200, 51.0350],
      [4.4200, 51.0150]
    ],
    leest: [
      [4.4200, 51.0350],
      [4.4500, 51.0350],
      [4.4500, 51.0550],
      [4.4200, 51.0550],
      [4.4200, 51.0350]
    ],
    heffen: [
      [4.4500, 51.0350],
      [4.4800, 51.0350],
      [4.4800, 51.0550],
      [4.4500, 51.0550],
      [4.4500, 51.0350]
    ],
    muizen: [
      [4.4890, 51.0000],
      [4.5200, 51.0000],
      [4.5200, 51.0200],
      [4.4890, 51.0200],
      [4.4890, 51.0000]
    ]
  };

  // Create combined polygon using turf.js
  const createCombinedPolygon = () => {
    const polygons = Object.values(MECHELEN_DISTRICTS).map(coordinates => 
      turf.polygon([[...coordinates]])
    );
    
    return polygons.reduce((combined, polygon) => 
      combined ? turf.union(combined, polygon) : polygon
    );
  };

  // Check if point is within combined polygon
  const isWithinMechelen = (lng: number, lat: number) => {
    const point = turf.point([lng, lat]);
    const combinedPolygon = createCombinedPolygon();
    return turf.booleanPointInPolygon(point, combinedPolygon);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.4800, 51.0280], // Center on Mechelen
      zoom: 12, // Adjusted zoom for better district view
      minZoom: 11, // Prevent zooming out too far
      maxZoom: 18 // Allow detailed zoom
    });

    setMap(newMap);

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add polygon overlay when map loads
    newMap.on('load', () => {
      const combinedPolygon = createCombinedPolygon();
      
      newMap.addSource('mechelen-districts', {
        type: 'geojson',
        data: combinedPolygon
      });

      // Add fill layer
      newMap.addLayer({
        id: 'mechelen-districts-fill',
        type: 'fill',
        source: 'mechelen-districts',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.2
        }
      });

      // Add outline layer
      newMap.addLayer({
        id: 'mechelen-districts-outline',
        type: 'line',
        source: 'mechelen-districts',
        paint: {
          'line-color': '#0080ff',
          'line-width': 2
        }
      });
    });

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      if (!isWithinMechelen(lng, lat)) {
        toast.error("Selecteer een locatie binnen Mechelen of haar deelgemeenten");
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
      <div ref={mapContainer} className="w-full h-full cursor-pin" />
    </div>
  );
};

export default LocationMap;