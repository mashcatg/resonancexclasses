import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, ArrowLeft, BookOpen, CheckCircle2, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword) return;
    
    setLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, firstName, lastName);
    if (!error) {
      setSignUpEmail('');
      setSignUpPassword('');
      setFirstName('');
      setLastName('');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const benefits = [
    "Access 15+ expert-led courses",
    "Learn at your own pace, anytime, anywhere",
    "Earn certificates upon completion",
    "Dedicated support from instructors",
  ];

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
             
                <img src="logo transparent.png" alt="Logo" className="w-24 h-24 brightness-0 invert" />

            </Link>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <GraduationCap className="h-16 w-16 text-white/80 mb-6" />
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Join Our Learning Community
                </h1>
                <p className="text-base sm:text-lg text-white/80">
                  Master new skills with our comprehensive courses. Affordable education from experienced professionals, designed to help you succeed.
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
              © {new Date().getFullYear()} ResonanceX Classes. All rights reserved. Build by <a href="https://studio.ennovat.com" className="text-primary underline">Ennovat Studio</a>
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
            {showForgotPassword ? (
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 py-4 space-y-1">
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to login
                  </button>
                  <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Enter your email and we'll send you a reset link
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-4 px-0">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail" className="text-xs sm:text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgotEmail"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 text-sm"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full text-sm" disabled={forgotLoading}>
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-none">
                <CardHeader className="space-y-1 py-4 px-0">
                  <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sign in to your account or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 text-xs sm:text-sm">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="name@example.com"
                              className="pl-10 text-sm"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-xs sm:text-sm text-primary hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 text-sm"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
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
                        <Button type="submit" className="w-full text-sm" disabled={loading}>
                          {loading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="John"
                                className="pl-10 text-sm"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Doe"
                                className="pl-10 text-sm"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signUpEmail" className="text-xs sm:text-sm">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signUpEmail"
                              type="email"
                              placeholder="name@example.com"
                              className="pl-10 text-sm"
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signUpPassword" className="text-xs sm:text-sm">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signUpPassword"
                              type={showSignUpPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 text-sm"
                              value={signUpPassword}
                              onChange={(e) => setSignUpPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full text-sm" disabled={loading}>
                          {loading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            
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

export default Login;
