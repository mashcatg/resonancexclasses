import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, TrendingUp, DollarSign, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // If not admin, redirect to student dashboard
  useEffect(() => {
    if (profile && !isAdmin) {
      navigate('/student/dashboard');
    }
  }, [isAdmin, profile, navigate]);

  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total courses
        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true });
        
        // Get unique students (from enrollments)
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('student_id');
        
        const uniqueStudents = new Set(enrollmentsData?.map(e => e.student_id) || []).size;
        
        // Get total enrollments
        const { count: enrollmentsCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true });
        
        // Get total revenue from enrollments (course prices)
        const { data: enrollmentsWithCourses } = await supabase
          .from('enrollments')
          .select('course_id, courses(price)')
          .not('courses', 'is', null);
        
        const totalRevenue = enrollmentsWithCourses?.reduce((sum, enrollment: any) => {
          return sum + (parseFloat(enrollment.courses?.price) || 0);
        }, 0) || 0;
        
        setStats({
          totalCourses: coursesCount || 0,
          totalStudents: uniqueStudents,
          totalEnrollments: enrollmentsCount || 0,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.first_name || 'Admin'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCourses === 0 ? 'No courses yet' : `${stats.totalCourses} course${stats.totalCourses > 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEnrollments} total enrollment{stats.totalEnrollments !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `৳${stats.revenue.toLocaleString('en-BD')}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.revenue === 0 ? 'No sales yet' : 'Total revenue'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEnrollments === 0 ? 'No enrollments yet' : 'Active enrollments'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Course Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create and manage your courses, add lessons, and track progress.
              </p>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link to="/admin/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Course
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/courses">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Student Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View student progress, manage enrollments, and track performance.
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/students">
                  <Eye className="h-4 w-4 mr-2" />
                  View Students
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;