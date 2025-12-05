import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const stats = [
    { icon: Users, value: "270+", label: "Expert Instructors" },
    { icon: BookOpen, value: "5,550+", label: "Quality Courses" },
    { icon: Award, value: "33K+", label: "Active Students" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>
      
      {/* Dot pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Admissions Open for 2025
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Unlock Your
              <span className="block text-blue-200">Learning Potential</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
              Join thousands of learners worldwide. Access premium courses from industry experts and transform your career with ResonanceX.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full group font-semibold shadow-lg"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full font-semibold"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label} 
                    className="text-center animate-scale-in"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mb-2">
                      <Icon className="h-5 w-5 text-blue-200" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main image container */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                  alt="Students learning together"
                  className="w-full h-[500px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>
              
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-float z-20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Certified</div>
                    <div className="font-bold text-foreground">Courses</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-float z-20" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Join</div>
                    <div className="font-bold text-foreground">33K+ Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
