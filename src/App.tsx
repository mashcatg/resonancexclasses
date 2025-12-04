import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseForm from "./pages/admin/CourseForm";
import CourseList from "./pages/admin/CourseList";
import CourseEdit from "./pages/admin/CourseEdit";
import CourseView from "./pages/admin/CourseView";
import Students from "./pages/admin/Students";
import EnrollmentRequests from "./pages/admin/EnrollmentRequests";
import StudentDashboard from "./pages/student/StudentDashboard";
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
            <Route path="/courses" element={<Courses />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/course/:courseId" 
              element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizAttempt />
                </ProtectedRoute>
              } 
            />
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
              path="/admin/enrollments" 
              element={
                <ProtectedRoute requireAdmin>
                  <EnrollmentRequests />
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
