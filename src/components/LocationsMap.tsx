import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
}

interface Drawing {
  image_path: string;
}

export const LocationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [approvedHearts, setApprovedHearts] = useState<Drawing[]>([]);

  // Default coordinates for Mechelen
  const defaultLng = 4.480469;
  const defaultLat = 51.028022;

  useEffect(() => {
    const fetchApprovedHearts = async () => {
      try {
        const { data, error } = await supabase
          .from('drawings')
          .select('image_path')
          .eq('status', 'approved');
        
        if (error) throw error;
        setApprovedHearts(data || []);
      } catch (error) {
        console.error('Error fetching approved hearts:', error);
        toast.error("Er ging iets mis bij het ophalen van de hartjes");
      }
    };

    fetchApprovedHearts();
  }, []);

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
      markerEl.style.border = '2px solid white';
      
      const heartUrl = getRandomHeartUrl();
      if (heartUrl) {
        markerEl.style.backgroundImage = `url(${heartUrl})`;
        markerEl.style.backgroundSize = 'contain';
        markerEl.style.backgroundPosition = 'center';
        markerEl.style.backgroundRepeat = 'no-repeat';
      }

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold mb-1">${location.name}</h3>
          <p>${location.description || ''}</p>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [locations, approvedHearts]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};