import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useLocationLikes } from '@/hooks/useLocationLikes';
import { useApprovedHearts } from '@/hooks/useApprovedHearts';
import { useLocations } from '@/hooks/useLocations';
import { cn } from "@/lib/utils";

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
    try {
      console.log('Getting random heart URL for:', randomHeart.image_path);
      const { data } = supabase.storage
        .from('optimized')
        .getPublicUrl(randomHeart.image_path);
      
      console.log('Generated URL:', data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error('Error generating heart URL:', err);
      return '';
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/2800love/cmf05cgl3002q01sje09q7jzy',
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
      } else {
        // Fallback to a heart icon if no image is available
        const heartIcon = document.createElement('div');
        heartIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#F26D85" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
        markerEl.appendChild(heartIcon);
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
  }, [locations, selectedLocationId, onLocationSelect, approvedHearts]);

  return (
    <div className="w-full h-[400px] md:h-[calc(100vh-4rem)] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};