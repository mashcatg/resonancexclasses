import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import JourneySection from "@/components/JourneySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { Clock, ArrowRight, BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
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
  const navigate = useNavigate();

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
      { label: "Development", href: "/courses" },
      { label: "Business", href: "/courses" },
      { label: "Design", href: "/courses" },
      { label: "Marketing", href: "/courses" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <JourneySection />
      <StatsSection />

      {/* Featured Courses Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-10 lg:mb-12">
            <div>
              <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Top Picks
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">
                Featured Courses
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
                Explore our most popular courses and start your learning journey today
              </p>
            </div>
            <Link to="/courses" className="mt-4 md:mt-0">
              <Button variant="outline" className="group">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredCourses.map((course, index) => (
              <Card 
                key={course.id} 
                className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-border hover:border-primary/30 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                    alt={course.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground font-semibold">
                      ৳{course.price.toLocaleString()}
                    </Badge>
                  </div>
                  {course.difficulty_level && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
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
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {truncateText(course.description || "", 100)}
                  </CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration_minutes || 0} mins</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FeaturesSection />
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Admissions Open for 2026 Batch
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-6 sm:mb-8">
              Start your learning journey today. Choose from 15+ quality courses and join 8,000+ successful students who have transformed their careers with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base lg:text-lg px-4 sm:px-8 py-3 sm:py-6 rounded-full font-semibold"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/30 bg-white/30 text-white hover:bg-white/10 text-sm sm:text-base lg:text-lg px-4 sm:px-8 py-3 sm:py-6 rounded-full font-semibold"
              >
                <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                +880 1950-095883
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181b1f] text-background py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/icon transparent.png" alt="Logo" className="w-12 h-12" />
              </Link>
              <p className="text-xs sm:text-sm text-background/70 mb-6">
                Empowering learners worldwide with premium education and expert-led courses.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="h-4 sm:h-5 w-4 sm:w-5" />
                  </a>
                ))}
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
                  <span className="text-xs sm:text-sm text-background/70">Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-background/70">+880 1950-095883</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-background/70">support@resonancex.com</span>
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
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
