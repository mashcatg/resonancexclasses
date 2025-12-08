import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, 
  Mail, 
  BookOpen, 
  Loader2, 
  Save, 
  ClipboardList, 
  Monitor, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Shield
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  completed_at: string | null;
  started_at: string;
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
  trx_id: string | null;
  created_at: string;
  course: {
    title: string;
  };
}

const StudentProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  
  // History data
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchEnrollmentCount();
      fetchHistoryData();
    }
  }, [user]);

  const fetchEnrollmentCount = async () => {
    const { count } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user?.id);
    setEnrollmentCount(count || 0);
  };

  const fetchHistoryData = async () => {
    setHistoryLoading(true);
    try {
      // Fetch quiz attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select(`
          id,
          quiz_id,
          score,
          max_score,
          percentage,
          completed_at,
          started_at,
          time_taken_minutes,
          quizzes (
            title,
            courses (
              title
            )
          )
        `)
        .eq("student_id", user?.id)
        .order("started_at", { ascending: false });

      if (attempts) {
        setQuizAttempts(attempts.map(a => ({
          ...a,
          quiz: {
            title: (a.quizzes as any)?.title || "Unknown Quiz",
            course: {
              title: (a.quizzes as any)?.courses?.title || "Unknown Course"
            }
          }
        })));
      }

      // Fetch device sessions
      const { data: deviceData } = await supabase
        .from("device_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .order("last_active_at", { ascending: false });

      if (deviceData) {
        setDevices(deviceData);
      }

      // Fetch transactions
      const { data: transactionData } = await supabase
        .from("transactions")
        .select(`
          id,
          amount,
          status,
          trx_id,
          created_at,
          courses (
            title
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (transactionData) {
        setTransactions(transactionData.map(t => ({
          ...t,
          course: {
            title: (t.courses as any)?.title || "Unknown Course"
          }
        })));
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeviceStatusBadge = (device: DeviceSession) => {
    if (!device.is_active) {
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
    }
    if (!device.is_approved) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active {device.is_primary && "(Primary)"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">My Profile</h1>
          <p className="text-muted-foreground text-sm md:text-md">Manage your account and view history</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz Attempts</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Devices</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center flex-col md:flex-row gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-center md:text-left">
                      {firstName && lastName
                        ? `${firstName} ${lastName}`
                        : user?.email}
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-md">{user?.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground justify-center md:justify-start">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {enrollmentCount} courses enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Separator />

                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Attempts Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Quiz Attempts
                </CardTitle>
                <CardDescription>Your quiz history and scores</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : quizAttempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No quiz attempts yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
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
                            <TableCell className="text-muted-foreground">{attempt.quiz.course.title}</TableCell>
                            <TableCell>
                              {attempt.completed_at ? (
                                <span className={`font-semibold ${(attempt.percentage || 0) >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                  {attempt.score}/{attempt.max_score} ({attempt.percentage?.toFixed(0)}%)
                                </span>
                              ) : (
                                <Badge variant="outline">In Progress</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(attempt.started_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {attempt.time_taken_minutes ? `${attempt.time_taken_minutes} min` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  My Devices
                </CardTitle>
                <CardDescription>Devices that have accessed your account</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : devices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No device sessions found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead>Browser / OS</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>First Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{device.device_name || "Unknown Device"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {device.browser} / {device.os}
                            </TableCell>
                            <TableCell>
                              {getDeviceStatusBadge(device)}
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(device.last_active_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(device.created_at), "MMM dd, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>Your payment history</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium">{tx.course.title}</TableCell>
                            <TableCell className="font-semibold text-primary">
                              ৳{tx.amount.toLocaleString('en-BD')}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-sm">
                              {tx.trx_id || "-"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(tx.status)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(tx.created_at), "MMM dd, yyyy")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfile;
