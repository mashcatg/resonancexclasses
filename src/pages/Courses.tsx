import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StudentNavbar from "@/components/StudentNavbar";
import EnrollmentModal from "@/components/EnrollmentModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Search, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  price: number;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_published: boolean;
}

const Courses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [pendingCourses, setPendingCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
      fetchPendingTransactions();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user?.id);

      if (error) throw error;
      setEnrolledCourses(new Set(data?.map(e => e.course_id) || []));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('course_id')
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCourses(new Set(data?.map(t => t.course_id) || []));
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  };

  const handleEnrollClick = (course: Course) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to enroll in courses.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setSelectedCourse(course);
    setEnrollModalOpen(true);
  };

  const handleEnrollmentSuccess = () => {
    if (selectedCourse) {
      setPendingCourses(prev => new Set([...prev, selectedCourse.id]));
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty_level === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
  const difficulties = Array.from(new Set(courses.map(c => c.difficulty_level).filter(Boolean)));

  const getDifficultyColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {user ? <StudentNavbar /> : <Header />}
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Courses</h1>
          <p className="text-muted-foreground">Discover and enroll in our courses</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map(diff => (
                <SelectItem key={diff} value={diff!}>{diff}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.has(course.id);
              const isPending = pendingCourses.has(course.id);

              return (
                <Card key={course.id} className="flex flex-col">
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="line-clamp-2 flex-1">{course.title}</CardTitle>
                      {course.difficulty_level && (
                        <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                          {course.difficulty_level}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      {course.category && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {course.category}
                        </div>
                      )}
                      {course.duration_minutes && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.round(course.duration_minutes / 60)}h
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      ৳{course.price.toLocaleString('en-BD')}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isEnrolled ? (
                      <Button asChild className="w-full">
                        <Link to={`/student/course/${course.id}`}>
                          Go to Course
                        </Link>
                      </Button>
                    ) : isPending ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Pending Verification
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnrollClick(course)}
                        className="w-full"
                      >
                        Enroll Now
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <EnrollmentModal
        course={selectedCourse}
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
};

export default Courses;
