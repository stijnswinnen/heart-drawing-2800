import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

interface CategoryEditDialogProps {
  category: Tables<"categories"> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string | null, data: { name: string; color: string }) => Promise<void>;
}

const predefinedColors = [
  "#F29BA2", // Pink
  "#F26D85", // Red-pink
  "#7EA672", // Green  
  "#734439", // Brown
  "#F2DCE2", // Light pink
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#10B981", // Emerald
];

export const CategoryEditDialog = ({
  category,
  isOpen,
  onClose,
  onSave,
}: CategoryEditDialogProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#F29BA2");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    } else {
      setName("");
      setColor("#F29BA2");
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(category?.id || null, { name: name.trim(), color });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category ? "Categorie Bewerken" : "Nieuwe Categorie"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Bewerk de details van de categorie."
                : "Voeg een nieuwe categorie toe voor locaties."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voer categorienaam in..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Kleur</Label>
              <div className="space-y-3">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10"
                />
                
                <div className="grid grid-cols-5 gap-2">
                  {predefinedColors.map((predefColor) => (
                    <button
                      key={predefColor}
                      type="button"
                      onClick={() => setColor(predefColor)}
                      className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                        color === predefColor ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: predefColor }}
                      title={predefColor}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Voorvertoning: {color}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Opslaan..." : category ? "Bijwerken" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};