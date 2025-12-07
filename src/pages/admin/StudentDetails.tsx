import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Loader2, 
  BookOpen, 
  Award, 
  Monitor, 
  CreditCard,
  Calendar,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface StudentProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  course: {
    title: string;
    thumbnail_url: string | null;
  };
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  started_at: string;
  completed_at: string | null;
  time_taken_minutes: number | null;
  quiz: {
    title: string;
    course: {
      title: string;
    };
  };
}

interface DeviceSession {
  id: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_primary: boolean;
  last_active_at: string;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  trx_id: string | null;
  created_at: string;
  course: {
    title: string;
  };
}

const StudentDetails = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (studentId && isAdmin) {
      fetchStudentData();
    }
  }, [studentId, isAdmin]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", studentId)
        .single();

      if (profileError) throw profileError;
      setStudent(profileData);

      // Fetch enrollments
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (title, thumbnail_url)
        `)
        .eq("student_id", studentId)
        .order("enrolled_at", { ascending: false });

      if (enrollmentsData) {
        setEnrollments(
          enrollmentsData.map((e) => ({
            ...e,
            course: e.courses,
          })) as Enrollment[]
        );
      }

      // Fetch quiz attempts
      const { data: quizData } = await supabase
        .from("quiz_attempts")
        .select(`
          *,
          quizzes (
            title,
            courses (title)
          )
        `)
        .eq("student_id", studentId)
        .order("started_at", { ascending: false });

      if (quizData) {
        setQuizAttempts(
          quizData.map((q) => ({
            ...q,
            quiz: {
              title: q.quizzes?.title || "Unknown",
              course: {
                title: q.quizzes?.courses?.title || "Unknown",
              },
            },
          })) as QuizAttempt[]
        );
      }

      // Fetch device sessions
      const { data: sessionsData } = await supabase
        .from("device_sessions")
        .select("*")
        .eq("user_id", studentId)
        .order("created_at", { ascending: false });

      if (sessionsData) {
        setDeviceSessions(sessionsData);
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select(`
          *,
          courses (title)
        `)
        .eq("user_id", studentId)
        .order("created_at", { ascending: false });

      if (transactionsData) {
        setTransactions(
          transactionsData.map((t) => ({
            ...t,
            course: t.courses,
          })) as Transaction[]
        );
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "S";
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm md:text-md">
              You don't have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground mb-4">Student not found.</p>
              <Button asChild>
                <Link to="/admin/students">Back to Students</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/admin/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
        </div>

        {/* Student Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(student.first_name, student.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {student.first_name && student.last_name
                    ? `${student.first_name} ${student.last_name}`
                    : "No Name"}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(student.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{enrollments.length}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{quizAttempts.length}</div>
                  <div className="text-xs text-muted-foreground">Quizzes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="enrollments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Enrollments
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Quiz Attempts
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Course Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No enrollments found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.course.title}</TableCell>
                          <TableCell>
                            {format(new Date(enrollment.enrolled_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={enrollment.progress_percentage} className="w-20 h-2" />
                              <span className="text-sm">{enrollment.progress_percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {enrollment.completed_at ? (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            ) : enrollment.progress_percentage > 0 ? (
                              <Badge variant="secondary">In Progress</Badge>
                            ) : (
                              <Badge variant="outline">Not Started</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Attempts Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quiz Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                {quizAttempts.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No quiz attempts found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizAttempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">{attempt.quiz.title}</TableCell>
                          <TableCell>{attempt.quiz.course.title}</TableCell>
                          <TableCell>
                            {attempt.score !== null && attempt.max_score !== null ? (
                              <span className={attempt.percentage && attempt.percentage >= 70 ? "text-green-600" : "text-red-600"}>
                                {attempt.score}/{attempt.max_score} ({attempt.percentage}%)
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(attempt.started_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {attempt.time_taken_minutes ? `${attempt.time_taken_minutes} min` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Device Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {deviceSessions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No device sessions found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deviceSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{session.device_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {session.browser} • {session.os}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(session.last_active_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            {session.is_approved && session.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active {session.is_primary && "(Primary)"}
                              </Badge>
                            ) : !session.is_active ? (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Revoked
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.course.title}</TableCell>
                          <TableCell>৳{transaction.amount.toLocaleString("en-BD")}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {transaction.trx_id || "-"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(transaction.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {transaction.status === "completed" ? (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            ) : transaction.status === "pending" ? (
                              <Badge variant="secondary">Pending</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDetails;