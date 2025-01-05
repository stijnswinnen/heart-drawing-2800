import React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="shareConsent"
          checked={shareConsent}
          onCheckedChange={(checked) => onShareConsentChange(checked as boolean)}
        />
        <label
          htmlFor="shareConsent"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Ja, ik wil mijn verhaal delen.
        </label>
      </div>
    </div>
  );
};