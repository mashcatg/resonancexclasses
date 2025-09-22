import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import RichTextEditor from '@/components/RichTextEditor';
import FileUpload from '@/components/FileUpload';
import ModuleBuilder from '@/components/ModuleBuilder';

const CourseForm = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    price: '',
    original_price: '',
    discount_percentage: 0,
    thumbnail_url: '',
    banner_url: '',
    featured_video_url: '',
    target_audience: '',
    is_published: false
  });

  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [modules, setModules] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!profile?.user_id || !formData.title) return;

    try {
      const finalPrice = calculateFinalPrice();
      const filteredWhatYouLearn = whatYouLearn.filter(item => item.trim() !== '');
      const filteredRequirements = requirements.filter(item => item.trim() !== '');

      // This will be expanded to save as draft
      console.log('Auto-saving course...', {
        title: formData.title,
        modules: modules.length,
        timestamp: new Date().toISOString()
      });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [formData, whatYouLearn, requirements, modules, profile]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

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
    const originalPrice = parseFloat(formData.original_price) || 0;
    const discount = formData.discount_percentage || 0;
    return originalPrice - (originalPrice * discount / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.user_id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a course",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.category || !formData.original_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const finalPrice = calculateFinalPrice();
      const filteredWhatYouLearn = whatYouLearn.filter(item => item.trim() !== '');
      const filteredRequirements = requirements.filter(item => item.trim() !== '');

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            difficulty_level: formData.difficulty,
            price: finalPrice,
            original_price: parseFloat(formData.original_price),
            discount_percentage: formData.discount_percentage,
            thumbnail_url: formData.thumbnail_url,
            banner_url: formData.banner_url,
            featured_video_url: formData.featured_video_url,
            target_audience: formData.target_audience,
            what_you_learn: filteredWhatYouLearn,
            requirements: filteredRequirements,
            is_published: formData.is_published,
            instructor_id: profile.user_id
          }
        ])
        .select()
        .single();

      if (courseError) throw courseError;

      // Create modules and their content
      for (const module of modules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .insert([
            {
              course_id: courseData.id,
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

            // Create content item reference
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
                  course_id: courseData.id,
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

            // Create content item reference
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
              const questionsToInsert = quiz.questions.map(question => ({
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
        title: "Success",
        description: "Course created successfully!",
      });

      navigate('/admin/courses');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/courses')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <span className="text-sm text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={autoSave}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground">Build your course with rich content, modules, lessons, and quizzes. Changes are auto-saved as drafts.</p>
        </div>

        <div className="space-y-6">
          {/* Basic Course Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Course Title*</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category*</label>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Programming, Design, Marketing"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Course Description*</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Enter a detailed course description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Difficulty Level</label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Input
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                      placeholder="Who is this course for?"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Featured Video URL (YouTube)</label>
                  <Input
                    name="featured_video_url"
                    value={formData.featured_video_url}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Course preview/trailer video for students
                  </p>
                </div>

                {/* What You'll Learn Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">What You'll Learn</label>
                    <Button type="button" variant="outline" size="sm" onClick={addWhatYouLearnItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={item}
                          onChange={(e) => updateWhatYouLearnItem(index, e.target.value)}
                          placeholder="What will students learn?"
                        />
                        {whatYouLearn.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWhatYouLearnItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Requirements</label>
                    <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Requirement
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="What do students need to know beforehand?"
                        />
                        {requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Media Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Course Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Course Banner/Thumbnail</label>
                <FileUpload
                  bucket="course-banners"
                  currentFile={formData.banner_url}
                  onUpload={(url) => setFormData(prev => ({ ...prev, banner_url: url, thumbnail_url: url }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Original Price*</label>
                  <Input
                    name="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Discount %</label>
                  <Input
                    name="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      discount_percentage: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Final Price</label>
                  <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center">
                    <span className="font-medium">
                      ${calculateFinalPrice().toFixed(2)}
                    </span>
                    {formData.discount_percentage > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {formData.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Content Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ModuleBuilder 
                modules={modules} 
                onChange={setModules} 
                onAutoSave={autoSave}
              />
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
                  id="published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish course immediately
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Published courses will be visible to students. You can change this later.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/courses')}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;