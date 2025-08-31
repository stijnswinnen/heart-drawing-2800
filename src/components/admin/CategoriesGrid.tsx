import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryEditDialog } from "./CategoryEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

export const CategoriesGrid = () => {
  const [editingCategory, setEditingCategory] = useState<Tables<"categories"> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
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

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsEditDialogOpen(true);
  };

  const handleEditCategory = (category: Tables<"categories">) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Tables<"categories">) => {
    if (!confirm(`Weet je zeker dat je de categorie "${category.name}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) throw error;

      toast.success("Categorie succesvol verwijderd");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fout bij het verwijderen van de categorie");
    }
  };

  const handleSaveCategory = async (
    categoryId: string | null,
    data: { name: string; color: string }
  ) => {
    try {
      if (categoryId) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", categoryId);

        if (error) throw error;
        toast.success("Categorie succesvol bijgewerkt");
      } else {
        // Create new category
        const { error } = await supabase
          .from("categories")
          .insert(data);

        if (error) throw error;
        toast.success("Categorie succesvol toegevoegd");
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Fout bij het opslaan van de categorie");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Beheer categorieën voor locaties
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Categorie
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                      borderColor: category.color,
                    }}
                  >
                    {category.color}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Nog geen categorieën toegevoegd.
          </p>
          <Button onClick={handleAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Eerste Categorie Toevoegen
          </Button>
        </Card>
      )}

      <CategoryEditDialog
        category={editingCategory}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
};