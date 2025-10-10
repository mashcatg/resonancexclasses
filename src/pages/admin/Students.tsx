import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface StudentData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  enrollmentCount: number;
  totalProgress: number;
}

const Students = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Get all profiles with student role
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');
        
        if (profilesError) throw profilesError;

        // Get enrollment data for each student
        const studentsWithStats = await Promise.all(
          (profilesData || []).map(async (profile) => {
            const { data: enrollments } = await supabase
              .from('enrollments')
              .select('progress_percentage')
              .eq('student_id', profile.user_id);
            
            const enrollmentCount = enrollments?.length || 0;
            const totalProgress = enrollments?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) || 0;
            const avgProgress = enrollmentCount > 0 ? Math.round(totalProgress / enrollmentCount) : 0;

            return {
              id: profile.user_id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
              enrollmentCount,
              totalProgress: avgProgress,
            };
          })
        );

        setStudents(studentsWithStats);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin]);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'S';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all enrolled students
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No students enrolled yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Courses Enrolled</TableHead>
                    <TableHead>Avg Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={student.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(student.first_name, student.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.first_name && student.last_name
                                ? `${student.first_name} ${student.last_name}`
                                : 'No Name'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.enrollmentCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${student.totalProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{student.totalProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.enrollmentCount > 0 ? "default" : "secondary"}>
                          {student.enrollmentCount > 0 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Students;
