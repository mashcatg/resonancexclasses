import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Loader2,
  GraduationCap,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import EnrollmentModal from "@/components/EnrollmentModal";
import { stripHtml, truncateText } from "@/lib/htmlUtils";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  category: string | null;
  difficulty_level: string | null;
  duration_minutes: number | null;
  what_you_learn: string[] | null;
  requirements: string[] | null;
  target_audience: string | null;
  featured_video_url: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: { id: string; title: string; duration_minutes: number | null }[];
  quizzes: { id: string; title: string }[];
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("is_published", true)
        .single();

      if (courseError) throw courseError;

      // Parse JSON fields
      const parsedCourse: Course = {
        ...courseData,
        what_you_learn: Array.isArray(courseData.what_you_learn)
          ? (courseData.what_you_learn as string[])
          : [],
        requirements: Array.isArray(courseData.requirements)
          ? (courseData.requirements as string[])
          : [],
      };
      setCourse(parsedCourse);

      // Fetch modules with lessons and quizzes
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("id, title, description, order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (modulesData) {
        const modulesWithContent = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessons } = await supabase
              .from("lessons")
              .select("id, title, duration_minutes")
              .eq("module_id", module.id)
              .order("order_index", { ascending: true });

            const { data: quizzes } = await supabase
              .from("quizzes")
              .select("id, title")
              .eq("module_id", module.id)
              .eq("is_active", true)
              .order("order_index", { ascending: true });

            return {
              ...module,
              lessons: lessons || [],
              quizzes: quizzes || [],
            };
          })
        );
        setModules(modulesWithContent);
      }

      // Fetch enrollment count
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId);
      setEnrollmentCount(count || 0);

      // Check if user is enrolled or has pending transaction
      if (user) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("course_id", courseId)
          .eq("student_id", user.id)
          .single();

        setIsEnrolled(!!enrollment);

        if (!enrollment) {
          const { data: pendingTx } = await supabase
            .from("transactions")
            .select("id")
            .eq("course_id", courseId)
            .eq("user_id", user.id)
            .eq("status", "pending")
            .single();

          setIsPending(!!pendingTx);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrollModalOpen(true);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalQuizzes = modules.reduce((acc, m) => acc + m.quizzes.length, 0);
  const totalDuration = modules.reduce(
    (acc, m) =>
      acc + m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0),
    0
  );

  // Description handling
  const descriptionText = stripHtml(course?.description || '');
  const shouldTruncateDescription = descriptionText.length > 300;
  const displayDescription = showFullDescription || !shouldTruncateDescription 
    ? descriptionText 
    : `${descriptionText.substring(0, 300)}...`;

  const hasBanner = !!course?.banner_url;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">Course not found.</p>
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
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className={`py-12 ${hasBanner ? '' : 'bg-gradient-to-br from-primary/10 via-background to-background'}`}
        style={
          hasBanner
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${course.banner_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <Badge 
                    variant="secondary" 
                    className={hasBanner ? "bg-white/20 text-white border-white/30 hover:bg-white/30" : ""}
                  >
                    {course.category}
                  </Badge>
                )}
                {course.difficulty_level && (
                  <Badge 
                    variant="outline" 
                    className={hasBanner ? "bg-primary/20 text-white border-primary/50 hover:bg-primary/30" : ""}
                  >
                    {course.difficulty_level}
                  </Badge>
                )}
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${hasBanner ? 'text-white' : 'text-foreground'}`}>
                {course.title}
              </h1>
              <div className={hasBanner ? 'text-white/90' : 'text-muted-foreground'}>
                <p className="text-lg">
                  {displayDescription}
                </p>
                {shouldTruncateDescription && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className={`mt-2 flex items-center gap-1 text-sm font-medium ${hasBanner ? 'text-primary-foreground hover:text-white' : 'text-primary hover:underline'}`}
                  >
                    {showFullDescription ? (
                      <>
                        Show Less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show More <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className={`flex flex-wrap items-center gap-4 text-sm ${hasBanner ? 'text-white/80' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {enrollmentCount} students
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" />
                  {totalQuizzes} quizzes
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-4">
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        ৳{course.price.toLocaleString("en-BD")}
                      </span>
                      {course.original_price && course.original_price > course.price && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            ৳{course.original_price.toLocaleString("en-BD")}
                          </span>
                          <Badge variant="destructive">
                            {course.discount_percentage}% OFF
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/student/course/${course.id}`}>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Go to Course
                      </Link>
                    </Button>
                  ) : isPending ? (
                    <Button className="w-full" size="lg" disabled>
                      <Clock className="h-5 w-5 mr-2" />
                      Pending Approval
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnrollClick}
                    >
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.what_you_learn.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {modules.length} modules • {totalLessons} lessons •{" "}
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module, idx) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex-1">
                          <span className="font-medium">
                            {idx + 1}. {module.title}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {module.lessons.length} lessons
                            {module.quizzes.length > 0 &&
                              ` • ${module.quizzes.length} quiz`}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-2 text-sm text-muted-foreground"
                            >
                              <Lock className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.duration_minutes && (
                                <span className="text-xs">
                                  {lesson.duration_minutes}m
                                </span>
                              )}
                            </div>
                          ))}
                          {module.quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="flex items-center gap-3 p-2 text-sm text-muted-foreground"
                            >
                              <HelpCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                              <span className="flex-1">{quiz.title}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        {req}
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
                  <CardTitle>Who This Course is For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {course.target_audience}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {course && (
        <EnrollmentModal
          open={enrollModalOpen}
          onOpenChange={setEnrollModalOpen}
          course={{
            id: course.id,
            title: course.title,
            price: course.price,
          }}
          onSuccess={() => {
            setIsPending(true);
            setEnrollModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CourseDetails;