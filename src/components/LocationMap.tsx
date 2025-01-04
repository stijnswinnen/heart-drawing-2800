import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";
import * as turf from '@turf/turf';
import { mechelenDistricts, getDistrictName } from '@/data/mechelen-districts';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  // Mechelen boundaries
  const MECHELEN_BOUNDS: [[number, number], [number, number]] = [
    [4.4400, 51.0060], // Southwest
    [4.5200, 51.0500]  // Northeast
  ];

  const isWithinDistrict = (lng: number, lat: number) => {
    const point = turf.point([lng, lat]);
    
    for (const feature of mechelenDistricts.features) {
      if (turf.booleanPointInPolygon(point, feature.geometry)) {
        return {
          isValid: true,
          districtName: getDistrictName(feature.properties)
        };
      }
    }
    
    return {
      isValid: false,
      districtName: null
    };
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.4800, 51.0280], // Center on Mechelen
      zoom: 12,
      maxBounds: MECHELEN_BOUNDS,
      minZoom: 11,
      maxZoom: 18
    });

    setMap(newMap);

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add district boundaries when map loads
    newMap.on('load', () => {
      // Add districts source
      newMap.addSource('districts', {
        type: 'geojson',
        data: mechelenDistricts
      });

      // Add fill layer
      newMap.addLayer({
        id: 'district-fills',
        type: 'fill',
        source: 'districts',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.1
        }
      });

      // Add border layer
      newMap.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#088',
          'line-width': 2
        }
      });
    });

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      const districtCheck = isWithinDistrict(lng, lat);
      
      if (!districtCheck.isValid) {
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
      toast.success(`Locatie geselecteerd in ${districtCheck.districtName}!`);
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