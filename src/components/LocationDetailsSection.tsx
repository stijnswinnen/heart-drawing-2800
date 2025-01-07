import React from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface LocationDetailsSectionProps {
  locationName: string;
  description: string;
  recommendation: string;
  shareConsent: boolean;
  onLocationNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRecommendationChange: (value: string) => void;
  onShareConsentChange: (checked: boolean) => void;
}

export const LocationDetailsSection = ({
  locationName,
  description,
  recommendation,
  shareConsent,
  onLocationNameChange,
  onDescriptionChange,
  onRecommendationChange,
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
          Waarom is dit jouw lievelingsplek?
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="bvb: ik hou van deze plaats omdat ik hier tot rust kom..."
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="recommendation" className="block text-sm font-medium mb-1">
          Waarom moeten andere Mechelaars hier ook eens komen?
        </label>
        <Textarea
          id="recommendation"
          value={recommendation}
          onChange={(e) => onRecommendationChange(e.target.value)}
          placeholder="Vertel waarom anderen deze plek ook zouden moeten ontdekken..."
          rows={4}
          required
        />
      </div>
    </div>
  );
};