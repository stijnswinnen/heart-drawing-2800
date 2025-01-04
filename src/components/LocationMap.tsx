import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "sonner";
import * as turf from '@turf/turf';
import { mechelenDistricts } from '@/data/mechelen-districts';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMap = ({ onLocationSelect }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

  const isWithinMechelen = (lng: number, lat: number) => {
    const point = turf.point([lng, lat]);
    return mechelenDistricts.features.some(district => 
      turf.booleanPointInPolygon(point, district.geometry)
    );
  };

  const getDistrictName = (lng: number, lat: number) => {
    const point = turf.point([lng, lat]);
    const district = mechelenDistricts.features.find(district => 
      turf.booleanPointInPolygon(point, district.geometry)
    );
    return district?.properties?.smun_name_nl?.[0] || 'Mechelen';
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [4.48, 51.028], // Center on Mechelen
      zoom: 12,
      minZoom: 11,
      maxZoom: 18
    });

    setMap(newMap);

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add district boundaries
    newMap.on('load', () => {
      newMap.addSource('districts', {
        type: 'geojson',
        data: mechelenDistricts
      });

      newMap.addLayer({
        id: 'district-boundaries',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#FF0000',
          'line-width': 2
        }
      });

      newMap.addLayer({
        id: 'district-fill',
        type: 'fill',
        source: 'districts',
        paint: {
          'fill-color': '#FF0000',
          'fill-opacity': 0.1
        }
      });
    });

    // Handle click events
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      if (!isWithinMechelen(lng, lat)) {
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
      
      const districtName = getDistrictName(lng, lat);
      toast.success(`Locatie geselecteerd in ${districtName}!`);
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
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default LocationMap;