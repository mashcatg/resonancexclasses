import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle, Loader2, ArrowLeft, HelpCircle } from "lucide-react";
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  pdf_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  module_id: string;
  is_free: boolean;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  attempts_allowed: number;
  time_limit_minutes: number | null;
  module_id: string | null;
  order_index: number;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
}

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Security: Disable right-click, F12, and DevTools shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // Warning message in console
    console.clear();
    console.log('%cStop!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log(
      '%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam.',
      'font-size: 18px;'
    );

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch enrollment
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('student_id', user.id)
          .single();

        setEnrollment(enrollmentData);

        // Fetch completed lessons
        if (enrollmentData) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', user.id)
            .eq('course_id', courseId)
            .eq('completed', true);

          if (progressData) {
            setCompletedLessons(new Set(progressData.map(p => p.lesson_id)));
          }
        }
      }

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch lessons and quizzes for each module
      if (modulesData && modulesData.length > 0) {
        const lessonsMap: Record<string, Lesson[]> = {};
        const quizzesMap: Record<string, Quiz[]> = {};
        
        for (const module of modulesData) {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (lessonsData) {
            lessonsMap[module.id] = lessonsData;
          }

          const { data: quizzesData } = await supabase
            .from('quizzes')
            .select('*')
            .eq('module_id', module.id)
            .eq('is_active', true)
            .order('order_index', { ascending: true });

          if (quizzesData) {
            quizzesMap[module.id] = quizzesData;
          }
        }

        setLessons(lessonsMap);
        setQuizzes(quizzesMap);

        // Set first lesson as current
        const firstModuleLessons = lessonsMap[modulesData[0].id];
        if (firstModuleLessons && firstModuleLessons.length > 0) {
          setCurrentLesson(firstModuleLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user || !courseId || !enrollment) return;

    try {
      // Upsert lesson progress
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          student_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,lesson_id'
        });

      if (error) throw error;

      // Update local state
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.add(lessonId);
      setCompletedLessons(newCompletedLessons);

      // Calculate and update progress
      const allLessons = Object.values(lessons).flat();
      const totalLessons = allLessons.length;
      const completedCount = newCompletedLessons.size;
      const newProgress = Math.round((completedCount / totalLessons) * 100);

      await supabase
        .from('enrollments')
        .update({ progress_percentage: newProgress })
        .eq('id', enrollment.id);

      setEnrollment({ ...enrollment, progress_percentage: newProgress });

      toast({
        title: "Lesson Completed!",
        description: `Progress: ${newProgress}%`,
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">
                {!enrollment ? "You need to enroll in this course first." : "Course not found."}
              </p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {currentLesson?.video_url && (
              <Card className="select-none">
                <CardContent className="p-0">
                  <CustomVideoPlayer 
                    url={currentLesson.video_url} 
                    title={currentLesson.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Lesson Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{currentLesson?.title || course.title}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {currentLesson?.description || course.description}
                    </p>
                  </div>
                  {course.difficulty_level && (
                    <Badge variant="outline">{course.difficulty_level}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson?.pdf_url && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={currentLesson.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Resource
                    </a>
                  </Button>
                )}
                {currentLesson && !completedLessons.has(currentLesson.id) && (
                  <Button 
                    onClick={() => markLessonComplete(currentLesson.id)}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                {currentLesson && completedLessons.has(currentLesson.id) && (
                  <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Lesson Completed</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Course Content */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={enrollment.progress_percentage} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {enrollment.progress_percentage}% Complete
                </p>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module, idx) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{idx + 1}. {module.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {lessons[module.id]?.map((lesson) => {
                            const isCompleted = completedLessons.has(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setCurrentLesson(lesson)}
                                className={`w-full text-left p-2 rounded-md transition-colors ${
                                  currentLesson?.id === lesson.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                                  ) : lesson.video_url ? (
                                    <PlayCircle className="h-4 w-4 flex-shrink-0" />
                                  ) : (
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                  )}
                                  <span className="text-sm flex-1">{lesson.title}</span>
                                  {lesson.duration_minutes && (
                                    <span className="text-xs opacity-70">
                                      {lesson.duration_minutes}m
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                          {quizzes[module.id]?.map((quiz) => (
                            <Link
                              key={quiz.id}
                              to={`/student/quiz/${quiz.id}`}
                              className="block w-full text-left p-2 rounded-md transition-colors hover:bg-accent"
                            >
                              <div className="flex items-center space-x-2">
                                <HelpCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                                <span className="text-sm flex-1">{quiz.title}</span>
                                {quiz.time_limit_minutes && (
                                  <span className="text-xs opacity-70">
                                    {quiz.time_limit_minutes}min
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
