import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Eye, Users, Clock, DollarSign, BookOpen, HelpCircle } from 'lucide-react';
import { stripHtml } from '@/lib/htmlUtils';
import { Json } from '@/integrations/supabase/types';

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  target_audience: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  duration_minutes: number;
  featured_video_url: string;
  thumbnail_url: string;
  banner_url: string;
  is_published: boolean;
  created_at: string;
  what_you_learn: Json | null;
  requirements: Json | null;
}

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchEnrollmentCount();
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

      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course.",
        variant: "destructive",
      });
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact' })
        .eq('course_id', courseId);

      if (error) throw error;

      setEnrollmentCount(count || 0);
    } catch (error) {
      console.error('Error fetching enrollment count:', error);
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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Course not found.</div>
        </div>
      </div>
    );
  }

  const categories = course.category ? course.category.split(', ') : [];

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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={course.is_published ? "default" : "secondary"}>
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
                {categories.map(category => (
                  <Badge key={category} variant="outline">
                    {category.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button asChild>
                <Link to={`/student/course/${course.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              {course.is_published && (
                <Button variant="outline" asChild>
                  <Link to={`/courses/${course.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Live
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* YouTube Video Embed */}
            {course.featured_video_url && getYouTubeVideoId(course.featured_video_url) ? (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(course.featured_video_url)}`}
                      title={course.title}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                {course.description && typeof course.description === 'string' ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description || '' }}
                  />
                ) : (
                  <p className="text-muted-foreground">No description available.</p>
                )}
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.requirements && Array.isArray(course.requirements) && course.requirements.filter((item): item is string => typeof item === 'string').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.filter((item): item is string => typeof item === 'string').map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Target Audience */}
            {course.target_audience && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{course.target_audience}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Enrollments</span>
                  </div>
                  <span className="font-medium">{enrollmentCount}</span>
                </div>

                {course.duration_minutes > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-medium">
                      {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Price</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${course.price.toFixed(2)}</div>
                    {course.original_price && course.original_price > course.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${course.original_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="font-medium">
                    {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            {course.what_you_learn && Array.isArray(course.what_you_learn) && course.what_you_learn.filter((item): item is string => typeof item === 'string').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.what_you_learn.filter((item): item is string => typeof item === 'string').map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;