import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useLocationLikes } from '@/hooks/useLocationLikes';
import { useApprovedHearts } from '@/hooks/useApprovedHearts';
import { useLocations } from '@/hooks/useLocations';
import { cn } from "@/lib/utils"; // Added this import

interface LocationsMapProps {
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
}

export const LocationsMap = ({ selectedLocationId, onLocationSelect }: LocationsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const locations = useLocations();
  const approvedHearts = useApprovedHearts();
  const { locationLikes } = useLocationLikes();

  // Default coordinates for Mechelen
  const defaultLng = 4.480469;
  const defaultLat = 51.028022;

  const getRandomHeartUrl = () => {
    if (approvedHearts.length === 0) return '';
    const randomHeart = approvedHearts[Math.floor(Math.random() * approvedHearts.length)];
    return supabase.storage
      .from('optimized')
      .getPublicUrl(`optimized/${randomHeart.image_path}`).data.publicUrl;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

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

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      newMap.remove();
    };
  }, []);

  // Handle markers and selection
  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const markerEl = document.createElement('div');
      markerEl.className = cn(
        'w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden cursor-pointer',
        selectedLocationId === location.id ? 'ring-4 ring-primary-dark' : ''
      );
      markerEl.style.border = '5px solid white';
      
      const heartUrl = getRandomHeartUrl();
      if (heartUrl) {
        markerEl.style.backgroundImage = `url(${heartUrl})`;
        markerEl.style.backgroundSize = 'contain';
        markerEl.style.backgroundPosition = 'center';
        markerEl.style.backgroundRepeat = 'no-repeat';
      }

      // Add click handler
      markerEl.addEventListener('click', () => {
        onLocationSelect(location.id);
      });

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);

      // If this is the selected location, pan to it
      if (location.id === selectedLocationId && map.current) {
        map.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 15,
          duration: 1000
        });
      }
    });
  }, [locations, selectedLocationId, onLocationSelect]);

  return (
    <div className="w-full h-[400px] md:h-[calc(100vh-4rem)] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};