import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, CheckCircle, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the recovery token from the URL hash
    const handleRecoveryToken = async () => {
      try {
        // Check if there's a recovery token in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Recovery token detected, setting session...');
          
          // Set the session using the recovery tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting recovery session:', error);
            toast.error("Invalid or expired reset link. Please request a new one.");
            navigate("/login");
            return;
          }

          if (data.session) {
            console.log('Recovery session set successfully');
            // Clear the hash from URL for cleaner appearance
            window.history.replaceState(null, '', window.location.pathname);
            setIsValidSession(true);
            setCheckingSession(false);
            return;
          }
        }

        // If no recovery token in URL, check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidSession(true);
        } else {
          toast.error("Invalid or expired reset link. Please request a new one.");
          navigate("/login");
        }
      } catch (error) {
        console.error('Error handling recovery:', error);
        toast.error("Something went wrong. Please try again.");
        navigate("/login");
      } finally {
        setCheckingSession(false);
      }
    };

    handleRecoveryToken();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Access 15+ expert-led courses",
    "Learn at your own pace, anytime, anywhere",
    "Earn certificates upon completion",
    "Dedicated support from instructors",
  ];

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col bg-primary p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 mb-16">
              <img src="resonancexclasses-login-logo.png" alt="Logo" className="w-28 h-28 brightness-0 invert" />
            </Link>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <GraduationCap className="h-16 w-16 text-white/80 mb-6" />
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Think Learn Rise.<br />With RCA
                </h1>
                <p className="text-base sm:text-lg text-white/80 mb-4">
                  Learn smart, grow fast. Access quality online education with expert support anytime, anywhere.
                </p>
                <p className="text-base sm:text-lg text-white/90 font-medium italic">
                  Let hard work be a habit, dreams be your goal, and studying be your daily inspiration.
                </p>
              </div>
              
              {/* Benefits */}
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 sm:gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-xs sm:text-sm text-white/60">
              © {new Date().getFullYear()} ResonanceX Classes. All rights reserved. Build by <a href="https://studio.ennovat.com" className="text-white underline">Ennovat Studio</a>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center p-4 sm:p-8 lg:p-16 bg-background">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center space-x-2 mb-2 sm:mb-8">
            <img src="logo transparent.png" alt="Logo" className="w-24 h-24 brightness-0 invert" />
          </Link>

          <div className="w-full max-w-md mx-auto">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0 py-4 space-y-1">
                <Link
                  to="/login"
                  className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {success ? "Password Updated!" : "Set New Password"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {success 
                    ? "Your password has been updated successfully"
                    : "Enter your new password below"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4 px-0">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Your password has been updated successfully.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Redirecting to login...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs sm:text-sm">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter Your New Password"
                          className="pl-10 pr-10 text-sm"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Your New Password"
                          className="pl-10 pr-10 text-sm"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full text-sm" disabled={loading}>
                      {loading ? "Updating Password..." : "Update Password"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
            
            {/* Mobile footer */}
            <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground lg:hidden">
              © {new Date().getFullYear()} ResonanceX Classes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
