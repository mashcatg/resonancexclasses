import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface HeroSettings {
  id: string;
  main_heading: string;
  sub_heading: string;
  highlighted_text: string;
  description: string;
  button_text: string;
  hero_image_url: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  stat_4_value: string;
  stat_4_label: string;
  community_badge: string;
  community_title: string;
  community_subtitle: string;
  award_icon: string;
  award_title: string;
  award_subtitle: string;
  flag_icon: string;
  flag_title: string;
  flag_subtitle: string;
}

const HeroSettings = () => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HeroSettings | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSettings();
    }
  }, [isSuperAdmin]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings' as any)
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data as unknown as HeroSettings);
    } catch (error: any) {
      console.error('Error fetching hero settings:', error);
      toast({
        title: "Error",
        description: "Failed to load hero settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('hero_settings' as any)
        .update({
          main_heading: settings.main_heading,
          sub_heading: settings.sub_heading,
          highlighted_text: settings.highlighted_text,
          description: settings.description,
          button_text: settings.button_text,
          hero_image_url: settings.hero_image_url,
          stat_1_value: settings.stat_1_value,
          stat_1_label: settings.stat_1_label,
          stat_2_value: settings.stat_2_value,
          stat_2_label: settings.stat_2_label,
          stat_3_value: settings.stat_3_value,
          stat_3_label: settings.stat_3_label,
          stat_4_value: settings.stat_4_value,
          stat_4_label: settings.stat_4_label,
          community_badge: settings.community_badge,
          community_title: settings.community_title,
          community_subtitle: settings.community_subtitle,
          award_icon: settings.award_icon,
          award_title: settings.award_title,
          award_subtitle: settings.award_subtitle,
          flag_icon: settings.flag_icon,
          flag_title: settings.flag_title,
          flag_subtitle: settings.flag_subtitle,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero section settings updated successfully!",
      });
    } catch (error: any) {
      console.error('Error saving hero settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save hero settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    if (settings) {
      setSettings({ ...settings, hero_image_url: url });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Access Denied. Only superadmins can manage hero settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !settings) {
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
          <h1 className="text-3xl font-bold">Hero Section Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage the content displayed in the homepage hero section
          </p>
        </div>

        <div className="space-y-6">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Main Content</CardTitle>
              <CardDescription>Configure the primary hero section text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main_heading">Main Heading</Label>
                <Input
                  id="main_heading"
                  value={settings.main_heading}
                  onChange={(e) => setSettings({ ...settings, main_heading: e.target.value })}
                  placeholder="Unlock Your Potential"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub_heading">Sub Heading</Label>
                <Input
                  id="sub_heading"
                  value={settings.sub_heading}
                  onChange={(e) => setSettings({ ...settings, sub_heading: e.target.value })}
                  placeholder="with"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlighted_text">Highlighted Text</Label>
                <Input
                  id="highlighted_text"
                  value={settings.highlighted_text}
                  onChange={(e) => setSettings({ ...settings, highlighted_text: e.target.value })}
                  placeholder="ResonanceX Classes."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Join our expert-led courses..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={settings.button_text}
                  onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                  placeholder="Explore Classes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hero Image
              </CardTitle>
              <CardDescription>Upload or change the hero section image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Image</Label>
                {settings.hero_image_url && (
                  <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-4 border-border">
                    <img
                      src={settings.hero_image_url}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Upload New Image</Label>
                <FileUpload
                  bucket="uploads"
                  onUpload={handleImageUpload}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_image_url">Or Enter Image URL</Label>
                <Input
                  id="hero_image_url"
                  value={settings.hero_image_url}
                  onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics Section</CardTitle>
              <CardDescription>Configure the statistics displayed below the hero content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="space-y-2">
                  <Label htmlFor="stat_1_value">Stat 1 Value</Label>
                  <Input
                    id="stat_1_value"
                    value={settings.stat_1_value}
                    onChange={(e) => setSettings({ ...settings, stat_1_value: e.target.value })}
                    placeholder="8,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat_1_label">Stat 1 Label</Label>
                  <Input
                    id="stat_1_label"
                    value={settings.stat_1_label}
                    onChange={(e) => setSettings({ ...settings, stat_1_label: e.target.value })}
                    placeholder="Active Students"
                  />
                </div>

                {/* Stat 2 */}
                <div className="space-y-2">
                  <Label htmlFor="stat_2_value">Stat 2 Value</Label>
                  <Input
                    id="stat_2_value"
                    value={settings.stat_2_value}
                    onChange={(e) => setSettings({ ...settings, stat_2_value: e.target.value })}
                    placeholder="15+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat_2_label">Stat 2 Label</Label>
                  <Input
                    id="stat_2_label"
                    value={settings.stat_2_label}
                    onChange={(e) => setSettings({ ...settings, stat_2_label: e.target.value })}
                    placeholder="Total Courses"
                  />
                </div>

                {/* Stat 3 */}
                <div className="space-y-2">
                  <Label htmlFor="stat_3_value">Stat 3 Value</Label>
                  <Input
                    id="stat_3_value"
                    value={settings.stat_3_value}
                    onChange={(e) => setSettings({ ...settings, stat_3_value: e.target.value })}
                    placeholder="20+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat_3_label">Stat 3 Label</Label>
                  <Input
                    id="stat_3_label"
                    value={settings.stat_3_label}
                    onChange={(e) => setSettings({ ...settings, stat_3_label: e.target.value })}
                    placeholder="Instructors"
                  />
                </div>

                {/* Stat 4 */}
                <div className="space-y-2">
                  <Label htmlFor="stat_4_value">Stat 4 Value</Label>
                  <Input
                    id="stat_4_value"
                    value={settings.stat_4_value}
                    onChange={(e) => setSettings({ ...settings, stat_4_value: e.target.value })}
                    placeholder="24/7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat_4_label">Stat 4 Label</Label>
                  <Input
                    id="stat_4_label"
                    value={settings.stat_4_label}
                    onChange={(e) => setSettings({ ...settings, stat_4_label: e.target.value })}
                    placeholder="Support"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Section */}
          <Card>
            <CardHeader>
              <CardTitle>Community Section</CardTitle>
              <CardDescription>Configure the community call-to-action text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="community_badge">Community Badge</Label>
                <Input
                  id="community_badge"
                  value={settings.community_badge}
                  onChange={(e) => setSettings({ ...settings, community_badge: e.target.value })}
                  placeholder="8k+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="community_title">Community Title</Label>
                <Input
                  id="community_title"
                  value={settings.community_title}
                  onChange={(e) => setSettings({ ...settings, community_title: e.target.value })}
                  placeholder="Join our community"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="community_subtitle">Community Subtitle</Label>
                <Input
                  id="community_subtitle"
                  value={settings.community_subtitle}
                  onChange={(e) => setSettings({ ...settings, community_subtitle: e.target.value })}
                  placeholder="Start your journey today"
                />
              </div>
            </CardContent>
          </Card>

          {/* Floating Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Floating Badges</CardTitle>
              <CardDescription>Configure the small info badges around the hero image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Award badge */}
                <div className="space-y-2">
                  <Label htmlFor="award_icon">Award Icon (emoji)</Label>
                  <Input
                    id="award_icon"
                    value={settings.award_icon}
                    onChange={(e) => setSettings({ ...settings, award_icon: e.target.value })}
                    placeholder="🏆"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="award_title">Award Title</Label>
                  <Input
                    id="award_title"
                    value={settings.award_title}
                    onChange={(e) => setSettings({ ...settings, award_title: e.target.value })}
                    placeholder="World Best"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="award_subtitle">Award Subtitle</Label>
                  <Input
                    id="award_subtitle"
                    value={settings.award_subtitle}
                    onChange={(e) => setSettings({ ...settings, award_subtitle: e.target.value })}
                    placeholder="Top 10 popular"
                  />
                </div>

                {/* Language badge */}
                <div className="space-y-2">
                  <Label htmlFor="flag_icon">Language Icon (emoji)</Label>
                  <Input
                    id="flag_icon"
                    value={settings.flag_icon}
                    onChange={(e) => setSettings({ ...settings, flag_icon: e.target.value })}
                    placeholder="🇬🇧"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag_title">Language Title</Label>
                  <Input
                    id="flag_title"
                    value={settings.flag_title}
                    onChange={(e) => setSettings({ ...settings, flag_title: e.target.value })}
                    placeholder="English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag_subtitle">Language Subtitle</Label>
                  <Input
                    id="flag_subtitle"
                    value={settings.flag_subtitle}
                    onChange={(e) => setSettings({ ...settings, flag_subtitle: e.target.value })}
                    placeholder="20 Popular Courses"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSettings;
