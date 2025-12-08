import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceSession } from "@/hooks/useDeviceSession";
import { DeviceBlockedModal } from "@/components/DeviceBlockedModal";
import { Loader2 } from "lucide-react";

interface StudentProtectedRouteProps {
  children: ReactNode;
}

const StudentProtectedRoute = ({ children }: StudentProtectedRouteProps) => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const isStudent = profile?.role === "student";
  const { isBlocked, isRevoked, isLoading: deviceLoading } = useDeviceSession(user, isStudent);

  if (authLoading || (isStudent && deviceLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is a student and device is blocked, show the blocked modal
  if (isStudent && isBlocked) {
    return (
      <div className="min-h-screen bg-background">
        <DeviceBlockedModal open={true} onLogout={signOut} isRevoked={isRevoked} />
      </div>
    );
  }

  return <>{children}</>;
};

export default StudentProtectedRoute;
