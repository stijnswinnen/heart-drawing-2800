import React from 'react';
import LocationMap from './LocationMap';

interface LocationMapSectionProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export const LocationMapSection = ({ onLocationSelect }: LocationMapSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Verplaats de pinpoint naar de plek die je wilt delen:
      </label>
      <LocationMap onLocationSelect={onLocationSelect} />
    </div>
  );
};