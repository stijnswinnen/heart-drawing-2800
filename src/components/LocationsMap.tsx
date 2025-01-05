import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as turf from '@turf/turf';
import { mechelenBoundary } from '../data/mechelen-boundary';

interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
}

export const LocationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  // Default coordinates for Mechelen
  const defaultLng = 4.480469;
  const defaultLat = 51.028022;

  // Convert the GeoJSON coordinates to a mutable object
  const boundary = JSON.parse(JSON.stringify(mechelenBoundary));

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, description, latitude, longitude')
          .eq('status', 'approved')
          .eq('share_consent', true);

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast.error("Er ging iets mis bij het ophalen van de locaties");
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjgwMGxvdmUiLCJhIjoiY201aWcyNDJpMHJpMTJrczZ6bjB5Z2toZiJ9.N8jmpZW9QoVFiWa2VFIJFg';
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
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

      // Add markers for each location
      locations.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold mb-1">${location.name}</h3>
            <p>${location.description || ''}</p>
          </div>`
        );

        new mapboxgl.Marker()
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(newMap);
      });
    });

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup function
    return () => {
      newMap.remove();
    };
  }, [locations]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};