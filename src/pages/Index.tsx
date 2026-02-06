import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CategoriesSection from "@/components/CategoriesSection";
import RecentCoursesSection from "@/components/RecentCoursesSection";
import StatsSection from "@/components/StatsSection";
import JourneySection from "@/components/JourneySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InstructorsSection from "@/components/InstructorsSection";
import FAQSection from "@/components/FAQSection";
import PartnersSection from "@/components/PartnersSection";
import CTASection from "@/components/CTASection";
import { Clock, ArrowRight, BookOpen, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react";
import { truncateText } from "@/lib/htmlUtils";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  price: number;
  thumbnail_url: string | null;
  duration_minutes: number | null;
}

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  // Handle OAuth/Recovery callback - redirect appropriately
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    // If there's a recovery token, redirect to reset-password page immediately
    if (accessToken && type === 'recovery') {
      console.log('Recovery token detected, redirecting to reset-password...');
      // Keep the hash params for the reset-password page to use
      navigate('/reset-password' + window.location.hash, { replace: true });
      return;
    }
    
    // For OAuth (non-recovery), wait for auth to complete then redirect
    if (accessToken && !type) {
      setIsProcessingAuth(true);
    }
  }, [navigate]);

  // Handle OAuth redirect after session is established
  useEffect(() => {
    if (!isProcessingAuth) return;
    
    // Wait for loading to complete and user to be authenticated
    if (!loading && user) {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      
      // Small delay to ensure profile is fetched
      const redirectTimeout = setTimeout(() => {
        // Redirect based on user role (default to student if profile not loaded yet)
        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
        setIsProcessingAuth(false);
      }, 500);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [loading, user, profile, navigate, isProcessingAuth]);

  // Handle scroll to section when navigating from other pages
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        const element = document.getElementById(state.scrollTo!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      // Clear the state to prevent scrolling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, description, category, difficulty_level, price, thumbnail_url, duration_minutes")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (data) {
        setFeaturedCourses(data);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Show loading while processing OAuth - AFTER all hooks
  if (isProcessingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const footerLinks = {
    courses: [
      { label: "for SSC", href: "/courses?category=SSC" },
      { label: "for HSC", href: "/courses?category=HSC" },
      { label: "for Admission", href: "/courses?category=Admission" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <JourneySection />

      <CategoriesSection />

      {/* Featured Courses Section */}
      <section id="courses" className="py-12 sm:py-16 lg:py-20 bg-background scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-10 lg:mb-12">
            <div>
              <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Top Picks
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                Build Concepts, Boost Confidence
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground mt-2 max-w-xl">
                Master Physics, Chemistry & Math with RCA
              </p>
            </div>
            <Link to="/courses" className="mt-4 md:mt-0">
              <Button variant="link" className="group p-0 h-auto font-semibold text-primary hover:no-underline">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredCourses.map((course, index) => (
              <Card 
                key={course.id} 
                className="h-full overflow-hidden border-border hover:border-primary/30 cursor-pointer animate-fade-in flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-background/90 text-foreground font-semibold backdrop-blur-sm border-none shadow-sm">
                      ৳{course.price.toLocaleString()}
                    </Badge>
                  </div>
                  {course.difficulty_level && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className={`backdrop-blur-sm shadow-sm ${getDifficultyColor(course.difficulty_level)}`}>
                        {course.difficulty_level}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  {course.category && (
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      {course.category}
                    </span>
                  )}
                  <CardTitle className="text-lg line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <CardDescription className="line-clamp-2 mb-4">
                    {truncateText(course.description || "", 100)}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration_minutes ? `${Math.round(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m` : "Self-paced"}</span>
                    </div>
                    <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bento section: Why Choose Us (removed per instruction) */}
      {/* <FeaturesSection /> */}
      <InstructorsSection />
      <RecentCoursesSection />
      <TestimonialsSection />
      {/* FAQ removed per instruction */}
      {/* <FAQSection /> */}

      <CTASection />

      {/* Footer */}
      <footer id="contact" className="bg-[#181b1f] text-background py-12 sm:py-16 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/icon transparent.png" alt="Logo" className="w-12 h-12" />
              </Link>
              <p className="text-xs sm:text-sm text-background/70 mb-6">
                Strengthening Physics & Chemistry skills with expert guidance and practical learning
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61586706273711" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Facebook className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@rcaedtech" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Youtube className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              </div>
            </div>

            {/* Popular Courses */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Popular Courses</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.courses.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href} 
                      className="text-xs sm:text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-xs sm:text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-background/70">594, Donia Bazar Road, Donia (Building Next to Donia Mazar), Dhaka.</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-background/70">+880 1521-576576 (Sujon Sir)</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-background/70">+880 1590-097294 (Emu Sir)</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-background/70">Email: rcaedtech@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-background/10 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-background/60 text-xs sm:text-sm">
              © {new Date().getFullYear()} ResonanceX Classes. All rights reserved. Build by <a href="https://studio.ennovat.com" className="text-primary underline">Ennovat Studio</a>
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/privacy-policy" className="text-background/60 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-background/60 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
