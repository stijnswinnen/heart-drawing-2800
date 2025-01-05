import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { useLocationLikes } from '@/hooks/useLocationLikes';
import { useApprovedHearts } from '@/hooks/useApprovedHearts';
import { useLocations } from '@/hooks/useLocations';
import { cn } from '@/lib/utils';

export const LocationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const locations = useLocations();
  const approvedHearts = useApprovedHearts();
  const { locationLikes, handleLike } = useLocationLikes();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Handle markers
  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden';
      markerEl.style.border = '5px solid white';
      
      const heartUrl = getRandomHeartUrl();
      if (heartUrl) {
        markerEl.style.backgroundImage = `url(${heartUrl})`;
        markerEl.style.backgroundSize = 'contain';
        markerEl.style.backgroundPosition = 'center';
        markerEl.style.backgroundRepeat = 'no-repeat';
      }

      const likeCount = locationLikes[location.id] || 0;
      const isAuthenticated = !!session;
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold mb-1">${location.name}</h3>
          <p>${location.description || ''}</p>
          <div class="mt-2 flex items-center gap-2">
            <button 
              class="like-button flex items-center gap-1 ${isAuthenticated ? 'text-rose-500 hover:text-rose-600' : 'text-gray-300 cursor-not-allowed'}" 
              data-location-id="${location.id}"
              ${!isAuthenticated ? 'disabled' : ''}
              title="${!isAuthenticated ? 'Log in om te kunnen liken' : ''}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <span class="like-count">${likeCount}</span>
            </button>
          </div>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    // Add click event listeners to like buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const likeButton = target.closest('.like-button');
      if (likeButton && !likeButton.hasAttribute('disabled')) {
        const locationId = likeButton.getAttribute('data-location-id');
        if (locationId) {
          handleLike(locationId);
        }
      }
    });
  }, [locations, locationLikes, approvedHearts, session]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};