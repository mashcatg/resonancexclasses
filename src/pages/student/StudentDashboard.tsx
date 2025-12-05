import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock, Award, TrendingUp, Target, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import StudentNavbar from "@/components/StudentNavbar";
import { truncateText } from "@/lib/htmlUtils";

interface Enrollment {
  id: string;
  progress_percentage: number;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    category: string;
    difficulty_level: string;
    duration_minutes: number;
  };
}

interface StudentStats {
  totalCourses: number;
  completedCourses: number;
  hoursLearned: number;
  averageProgress: number;
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            category,
            difficulty_level,
            duration_minutes
          )
        `)
        .eq('student_id', user?.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }

      const typedEnrollments = data.map(enrollment => ({
        ...enrollment,
        course: enrollment.courses
      })) as Enrollment[];

      setEnrollments(typedEnrollments);

      // Calculate stats
      const totalCourses = typedEnrollments.length;
      const completedCourses = typedEnrollments.filter(e => e.progress_percentage === 100).length;
      const totalProgress = typedEnrollments.reduce((acc, e) => acc + (e.progress_percentage || 0), 0);
      const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
      const hoursLearned = typedEnrollments.reduce((acc, e) => {
        const courseHours = e.course.duration_minutes / 60;
        const completedHours = courseHours * ((e.progress_percentage || 0) / 100);
        return acc + completedHours;
      }, 0);

      setStats({
        totalCourses,
        completedCourses,
        hoursLearned: Math.round(hoursLearned * 10) / 10,
        averageProgress,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const recentEnrollments = enrollments.slice(0, 3);
  const continuelearning = enrollments.filter(e => (e.progress_percentage || 0) < 100).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudentNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Welcome back, {profile?.first_name || 'Student'}!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                My Courses
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="sm">
                <Search className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Enrolled courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoursLearned}h</div>
              <p className="text-xs text-muted-foreground">Time invested</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {continuelearning.length > 0 ? (
                continuelearning.map((enrollment) => (
                  <div key={enrollment.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground line-clamp-2">{enrollment.course.title}</h3>
                      <Badge variant="outline" className={getDifficultyColor(enrollment.course.difficulty_level)}>
                        {enrollment.course.difficulty_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {truncateText(enrollment.course.description || '', 120)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {enrollment.progress_percentage}% complete
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/student/course/${enrollment.course.id}`}>
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No courses in progress</p>
                  <Button asChild className="mt-4">
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Recent Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEnrollments.length > 0 ? (
                recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground line-clamp-2">{enrollment.course.title}</h3>
                      <Badge variant="outline">
                        {enrollment.course.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {truncateText(enrollment.course.description || '', 120)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/student/course/${enrollment.course.id}`}>
                          View Course
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                  <Button asChild className="mt-4">
                    <Link to="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
