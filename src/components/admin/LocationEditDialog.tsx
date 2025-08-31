import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationEditDialogProps {
  location: Tables<"locations"> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationId: string, updates: Partial<Tables<"locations">>) => Promise<void>;
}

export const LocationEditDialog = ({
  location,
  isOpen,
  onClose,
  onSave,
}: LocationEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    recommendation: "",
    image_path: "",
    category: "",
    latitude: "",
    longitude: "",
    status: "new" as "new" | "approved" | "rejected" | "pending_verification",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        description: location.description || "",
        recommendation: location.recommendation || "",
        image_path: location.image_path || "",
        category: location.category || "none",
        latitude: location.latitude?.toString() || "",
        longitude: location.longitude?.toString() || "",
        status: location.status,
      });
    }
  }, [location]);

  const handleSave = async () => {
    if (!location) return;

    setIsSaving(true);
    try {
      const updates: Partial<Tables<"locations">> = {
        name: formData.name,
        description: formData.description || null,
        recommendation: formData.recommendation || null,
        image_path: formData.image_path || null,
        category: formData.category === "none" ? null : formData.category || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        status: formData.status,
      };

      await onSave(location.id, updates);
      onClose();
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Locatie bewerken</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Locatie naam"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="new">Nieuw</SelectItem>
                  <SelectItem value="approved">Goedgekeurd</SelectItem>
                  <SelectItem value="pending_verification">In afwachting</SelectItem>
                  <SelectItem value="rejected">Afgekeurd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Beschrijving van de locatie"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation">Aanbeveling</Label>
            <Textarea
              id="recommendation"
              value={formData.recommendation}
              onChange={(e) => handleInputChange("recommendation", e.target.value)}
              placeholder="Waarom moet je deze plek zeker bezoeken?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_path">Afbeelding URL</Label>
              <Input
                id="image_path"
                value={formData.image_path}
                onChange={(e) => handleInputChange("image_path", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een categorie..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="none">Geen categorie</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Breedtegraad *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                placeholder="51.0261"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Lengtegraad *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                placeholder="4.4775"
                required
              />
            </div>
          </div>

          {formData.image_path && (
            <div className="space-y-2">
              <Label>Voorvertoning afbeelding</Label>
              <img 
                src={formData.image_path} 
                alt="Preview"
                className="w-full max-w-md h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !formData.name || !formData.latitude || !formData.longitude}
          >
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};