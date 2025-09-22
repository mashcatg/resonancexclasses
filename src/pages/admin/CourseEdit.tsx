import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import CategoryInput from '@/components/CategoryInput';

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    originalPrice: '',
    discountPercentage: '',
    duration: '',
    featuredVideoUrl: '',
    thumbnailUrl: '',
    bannerUrl: '',
    isPublished: false
  });
  
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          targetAudience: data.target_audience || '',
          originalPrice: data.original_price?.toString() || '',
          discountPercentage: data.discount_percentage?.toString() || '',
          duration: data.duration_minutes?.toString() || '',
          featuredVideoUrl: data.featured_video_url || '',
          thumbnailUrl: data.thumbnail_url || '',
          bannerUrl: data.banner_url || '',
          isPublished: data.is_published || false
        });
        
        if (data.category) {
          setCategories(data.category.split(', ').filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course data.",
        variant: "destructive",
      });
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.user_id) return;

    setSaving(true);

    try {
      const finalPrice = formData.originalPrice && formData.discountPercentage
        ? parseFloat(formData.originalPrice) * (1 - parseInt(formData.discountPercentage) / 100)
        : parseFloat(formData.originalPrice) || 0;

      const { error } = await supabase
        .from('courses')
        .update({
          title: formData.title,
          description: formData.description,
          category: categories.join(', '),
          target_audience: formData.targetAudience,
          price: finalPrice,
          original_price: parseFloat(formData.originalPrice) || null,
          discount_percentage: parseInt(formData.discountPercentage) || 0,
          duration_minutes: parseInt(formData.duration) || 0,
          featured_video_url: formData.featuredVideoUrl,
          thumbnail_url: formData.thumbnailUrl,
          banner_url: formData.bannerUrl,
          is_published: formData.isPublished
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Course updated successfully.",
      });

      navigate('/admin/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading course...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          
          <h1 className="text-3xl font-bold">Edit Course</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Course Description</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              <div>
                <Label htmlFor="category">Categories*</Label>
                <CategoryInput
                  value={categories}
                  onChange={setCategories}
                  placeholder="Add categories (e.g., Web Development, JavaScript, React)"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="Who is this course for?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price ($)</Label>
                  <Input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  placeholder="Course thumbnail image URL"
                />
              </div>

              <div>
                <Label htmlFor="bannerUrl">Banner URL</Label>
                <Input
                  id="bannerUrl"
                  name="bannerUrl"
                  value={formData.bannerUrl}
                  onChange={handleInputChange}
                  placeholder="Course banner image URL"
                />
              </div>

              <div>
                <Label htmlFor="featuredVideoUrl">Featured Video URL</Label>
                <Input
                  id="featuredVideoUrl"
                  name="featuredVideoUrl"
                  value={formData.featuredVideoUrl}
                  onChange={handleInputChange}
                  placeholder="Course preview/intro video URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* Publication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                />
                <Label htmlFor="isPublished">Publish Course</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Published courses will be visible to students and available for enrollment.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/courses')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Update Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEdit;