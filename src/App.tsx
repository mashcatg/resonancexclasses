import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudentProtectedRoute from "@/components/StudentProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import CourseForm from "./pages/admin/CourseForm";
import CourseList from "./pages/admin/CourseList";
import CourseEdit from "./pages/admin/CourseEdit";
import CourseView from "./pages/admin/CourseView";
import Students from "./pages/admin/Students";
import StudentDetails from "./pages/admin/StudentDetails";
import EnrollmentRequests from "./pages/admin/EnrollmentRequests";
import DeviceApprovals from "./pages/admin/DeviceApprovals";
import AdminProfile from "./pages/admin/AdminProfile";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import CoursePage from "./pages/student/CoursePage";
import QuizAttempt from "./pages/student/QuizAttempt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* Student routes with device session check */}
            <Route 
              path="/student/dashboard" 
              element={
                <StudentProtectedRoute>
                  <StudentDashboard />
                </StudentProtectedRoute>
              } 
            />
            <Route 
              path="/student/profile" 
              element={
                <StudentProtectedRoute>
                  <StudentProfile />
                </StudentProtectedRoute>
              } 
            />
            <Route 
              path="/student/course/:courseId"
              element={
                <StudentProtectedRoute>
                  <CoursePage />
                </StudentProtectedRoute>
              } 
            />
            <Route 
              path="/student/quiz/:quizId" 
              element={
                <StudentProtectedRoute>
                  <QuizAttempt />
                </StudentProtectedRoute>
              } 
            />
            {/* Admin routes */}
            <Route 
              path="/admin/courses" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/new" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/edit" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/view" 
              element={
                <ProtectedRoute requireAdmin>
                  <CourseView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute requireAdmin>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students/:studentId" 
              element={
                <ProtectedRoute requireAdmin>
                  <StudentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/enrollments" 
              element={
                <ProtectedRoute requireAdmin>
                  <EnrollmentRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/device-approvals" 
              element={
                <ProtectedRoute requireAdmin>
                  <DeviceApprovals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminProfile />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
