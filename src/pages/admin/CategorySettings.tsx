import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface CategorySetting {
  id: string;
  category_name: string;
  image_url: string;
  badge_text: string | null;
  display_order: number;
  is_active: boolean;
}

const CategorySettings = () => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategorySetting[]>([]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCategories();
    }
  }, [isSuperAdmin]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('category_settings' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data as unknown as CategorySetting[]);
    } catch (error: any) {
      console.error('Error fetching category settings:', error);
      toast({
        title: "Error",
        description: "Failed to load category settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const category of categories) {
        const { error } = await supabase
          .from('category_settings' as any)
          .update({
            image_url: category.image_url,
            badge_text: category.badge_text,
            display_order: category.display_order,
            is_active: category.is_active,
          })
          .eq('id', category.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Category settings updated successfully!",
      });
    } catch (error: any) {
      console.error('Error saving category settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (categoryId: string, url: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, image_url: url } : cat
      )
    );
  };

  const updateCategory = (categoryId: string, field: keyof CategorySetting, value: any) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      )
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Access Denied. Only superadmins can manage category settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Category Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage the category images displayed on the homepage
          </p>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {category.category_name}
                </CardTitle>
                <CardDescription>Configure the {category.category_name} category appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Image Preview */}
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    {category.image_url && (
                      <div className="relative aspect-[4/5] max-w-[250px] rounded-2xl overflow-hidden border-4 border-border">
                        <img
                          src={category.image_url}
                          alt={category.category_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Upload Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload New Image</Label>
                      <FileUpload
                        bucket="uploads"
                        onUpload={(url) => handleImageUpload(category.id, url)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`image_url_${category.id}`}>Or Enter Image URL</Label>
                      <Input
                        id={`image_url_${category.id}`}
                        value={category.image_url}
                        onChange={(e) => updateCategory(category.id, 'image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`badge_${category.id}`}>Badge Text (optional)</Label>
                      <Input
                        id={`badge_${category.id}`}
                        value={category.badge_text || ''}
                        onChange={(e) => updateCategory(category.id, 'badge_text', e.target.value)}
                        placeholder="Popular, Top Rated, Trending..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`order_${category.id}`}>Display Order</Label>
                      <Input
                        id={`order_${category.id}`}
                        type="number"
                        value={category.display_order}
                        onChange={(e) => updateCategory(category.id, 'display_order', parseInt(e.target.value) || 0)}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySettings;
