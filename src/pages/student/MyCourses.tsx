import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { truncateText } from "@/lib/htmlUtils";
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Search, Loader2, Play } from "lucide-react";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  progress_percentage: number;
}

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          progress_percentage,
          courses (
            id,
            title,
            description,
            category,
            difficulty_level,
            thumbnail_url,
            duration_minutes
          )
        `)
        .eq('student_id', user?.id);

      if (error) throw error;

      const enrolledCourses: EnrolledCourse[] = (enrollments || [])
        .filter(e => e.courses)
        .map(e => ({
          id: (e.courses as any).id,
          title: (e.courses as any).title,
          description: (e.courses as any).description,
          category: (e.courses as any).category,
          difficulty_level: (e.courses as any).difficulty_level,
          thumbnail_url: (e.courses as any).thumbnail_url,
          duration_minutes: (e.courses as any).duration_minutes,
          progress_percentage: e.progress_percentage || 0,
        }));

      setCourses(enrolledCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
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
      <StudentNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">My Courses</h1>
          <p className="text-muted-foreground text-sm md:text-md">Courses you're enrolled in</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
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
              <p className="text-muted-foreground text-sm md:text-md mb-4">
                {courses.length === 0 
                  ? "You haven't enrolled in any courses yet." 
                  : "No courses found matching your criteria."}
              </p>
              {courses.length === 0 && (
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate(`/student/course/${course.id}`)}
              >
                {course.thumbnail_url && (
                  <div className="relative">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Progress value={course.progress_percentage} className="h-2 flex-1" />
                        <span className="font-medium">{course.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
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
                    {truncateText(course.description || '', 150)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/course/${course.id}`);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {course.progress_percentage > 0 ? "Continue Learning" : "Start Course"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
