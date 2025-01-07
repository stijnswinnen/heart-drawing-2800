import React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface LocationDetailsSectionProps {
  locationName: string;
  description: string;
  shareConsent: boolean;
  onLocationNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onShareConsentChange: (checked: boolean) => void;
}

export const LocationDetailsSection = ({
  locationName,
  description,
  shareConsent,
  onLocationNameChange,
  onDescriptionChange,
  onShareConsentChange,
}: LocationDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="locationName" className="block text-sm font-medium mb-1">
          Naam van de locatie
        </label>
        <Input
          id="locationName"
          value={locationName}
          onChange={(e) => onLocationNameChange(e.target.value)}
          placeholder="Geef deze plek een naam"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Beschrijving
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Waarom is dit jouw favoriete plek?"
          rows={4}
          required
        />
      </div>
    </div>
  );
};