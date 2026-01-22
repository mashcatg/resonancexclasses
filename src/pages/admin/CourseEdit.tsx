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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import FileUpload from '@/components/FileUpload';
import ModuleBuilder from '@/components/ModuleBuilder';

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
    category: '',
    difficulty: '',
    targetAudience: '',
    originalPrice: '',
    discountPercentage: '',
    thumbnailUrl: '',
    bannerUrl: '',
    featuredVideoUrl: '',
    isPublished: false,
    contactNumber: '01950095883'
  });

  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchModules();
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
          category: data.category || '',
          difficulty: data.difficulty_level || '',
          targetAudience: data.target_audience || '',
          originalPrice: data.original_price?.toString() || '',
          discountPercentage: data.discount_percentage?.toString() || '',
          thumbnailUrl: data.thumbnail_url || '',
          bannerUrl: data.banner_url || '',
          featuredVideoUrl: data.featured_video_url || '',
          isPublished: data.is_published || false,
          contactNumber: (data as any).contact_number || '01950095883'
        });

        setWhatYouLearn((Array.isArray(data.what_you_learn) && data.what_you_learn.length > 0) 
          ? data.what_you_learn as string[] 
          : ['']);
        
        setRequirements((Array.isArray(data.requirements) && data.requirements.length > 0) 
          ? data.requirements as string[] 
          : ['']);
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

  const fetchModules = async () => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modulesWithContent = await Promise.all(
        (modulesData || []).map(async (module) => {
          const { data: contentItems } = await supabase
            .from('content_items')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          const content = await Promise.all(
            (contentItems || []).map(async (item) => {
              if (item.item_type === 'lesson') {
                const { data: lesson } = await supabase
                  .from('lessons')
                  .select('*')
                  .eq('id', item.item_id)
                  .single();
                return { id: item.id, type: 'lesson', data: lesson };
              } else {
                const { data: quiz } = await supabase
                  .from('quizzes')
                  .select('*')
                  .eq('id', item.item_id)
                  .single();

                const { data: questions } = await supabase
                  .from('quiz_questions')
                  .select('*')
                  .eq('quiz_id', item.item_id)
                  .order('order_index');

                return { 
                  id: item.id, 
                  type: 'quiz', 
                  data: { ...quiz, questions: questions || [] } 
                };
              }
            })
          );

          return {
            id: module.id,
            title: module.title,
            description: module.description,
            order_index: module.order_index,
            content: content.filter(Boolean)
          };
        })
      );

      setModules(modulesWithContent);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const addWhatYouLearnItem = () => {
    setWhatYouLearn([...whatYouLearn, '']);
  };

  const removeWhatYouLearnItem = (index: number) => {
    if (whatYouLearn.length > 1) {
      setWhatYouLearn(whatYouLearn.filter((_, i) => i !== index));
    }
  };

  const updateWhatYouLearnItem = (index: number, value: string) => {
    const updated = [...whatYouLearn];
    updated[index] = value;
    setWhatYouLearn(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const calculateFinalPrice = () => {
    const originalPrice = parseFloat(formData.originalPrice) || 0;
    const discount = parseFloat(formData.discountPercentage) || 0;
    return originalPrice - (originalPrice * discount / 100);
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
      const finalPrice = calculateFinalPrice();
      const filteredWhatYouLearn = whatYouLearn.filter(item => item.trim() !== '');
      const filteredRequirements = requirements.filter(item => item.trim() !== '');

      // Update course
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty_level: formData.difficulty,
          target_audience: formData.targetAudience,
          price: finalPrice,
          original_price: parseFloat(formData.originalPrice) || null,
          discount_percentage: parseInt(formData.discountPercentage) || 0,
          thumbnail_url: formData.thumbnailUrl,
          banner_url: formData.bannerUrl,
          featured_video_url: formData.featuredVideoUrl,
          what_you_learn: filteredWhatYouLearn,
          requirements: filteredRequirements,
          is_published: formData.isPublished,
          contact_number: formData.contactNumber
        })
        .eq('id', courseId);

      if (courseError) throw courseError;

      // Delete existing modules and content
      await supabase.from('course_modules').delete().eq('course_id', courseId);

      // Create modules and their content
      for (const module of modules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .insert([
            {
              course_id: courseId,
              title: module.title,
              description: module.description,
              order_index: module.order_index
            }
          ])
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Create content items for this module
        for (const contentItem of module.content) {
          if (contentItem.type === 'lesson') {
            const lesson = contentItem.data;
            const { data: lessonData, error: lessonError } = await supabase
              .from('lessons')
              .insert([
                {
                  module_id: moduleData.id,
                  title: lesson.title,
                  description: lesson.description,
                  video_url: lesson.video_url,
                  duration_minutes: lesson.duration_minutes,
                  is_free: lesson.is_free,
                  order_index: lesson.order_index,
                  pdf_url: lesson.pdf_url
                }
              ])
              .select()
              .single();

            if (lessonError) throw lessonError;

            await supabase.from('content_items').insert([
              {
                module_id: moduleData.id,
                item_type: 'lesson',
                item_id: lessonData.id,
                order_index: lesson.order_index
              }
            ]);
          } else if (contentItem.type === 'quiz') {
            const quiz = contentItem.data;
            const { data: quizData, error: quizError } = await supabase
              .from('quizzes')
              .insert([
                {
                  course_id: courseId,
                  module_id: moduleData.id,
                  title: quiz.title,
                  description: quiz.description,
                  time_limit_minutes: quiz.time_limit_minutes,
                  attempts_allowed: quiz.attempts_allowed,
                  points_per_question: quiz.points_per_question,
                  points_deducted_per_error: quiz.points_deducted_per_error,
                  total_questions: quiz.questions?.length || 0,
                  order_index: quiz.order_index
                }
              ])
              .select()
              .single();

            if (quizError) throw quizError;

            await supabase.from('content_items').insert([
              {
                module_id: moduleData.id,
                item_type: 'quiz',
                item_id: quizData.id,
                order_index: quiz.order_index
              }
            ]);

            // Create quiz questions
            if (quiz.questions && quiz.questions.length > 0) {
              const questionsToInsert = quiz.questions.map((question: any) => ({
                quiz_id: quizData.id,
                question_text: question.question_text,
                question_type: question.question_type,
                options: question.options,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
                points: question.points,
                order_index: question.order_index
              }));

              const { error: questionsError } = await supabase
                .from('quiz_questions')
                .insert(questionsToInsert);

              if (questionsError) throw questionsError;
            }
          }
        }
      }

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
                <Label htmlFor="category">Category*</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Web Development, JavaScript, React (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* What You'll Learn */}
          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {whatYouLearn.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={item}
                    onChange={(e) => updateWhatYouLearnItem(index, e.target.value)}
                    placeholder="Enter a learning outcome"
                  />
                  {whatYouLearn.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWhatYouLearnItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWhatYouLearnItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirements.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={item}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Enter a requirement"
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (৳)*</Label>
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

                <div>
                  <Label htmlFor="contactNumber">Payment Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    bKash number shown to students
                  </p>
                </div>
              </div>
              {formData.originalPrice && (
                <p className="text-sm text-muted-foreground">
                  Final Price: ৳{calculateFinalPrice().toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Thumbnail Image</Label>
                <FileUpload
                  bucket="course-banners"
                  currentFile={formData.thumbnailUrl}
                  onUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                  }}
                  maxSize={2 * 1024 * 1024}
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <FileUpload
                  bucket="course-banners"
                  currentFile={formData.bannerUrl}
                  onUpload={(url) => setFormData(prev => ({ ...prev, bannerUrl: url }))}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.webp']
                  }}
                  maxSize={2 * 1024 * 1024}
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

          {/* Course Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ModuleBuilder modules={modules} onChange={setModules} />
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
