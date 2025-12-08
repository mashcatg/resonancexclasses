import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Award } from "lucide-react";
import { Link } from "react-router-dom";
const HeroSection = () => {
  const stats = [{
    icon: Users,
    value: "50+",
    label: "Expert Instructors"
  }, {
    icon: BookOpen,
    value: "15+",
    label: "Quality Courses"
  }, {
    icon: Award,
    value: "8K+",
    label: "Active Students"
  }];
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>
      
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
      backgroundSize: '30px 30px'
    }} />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-xs md:text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Admissions Open for 2026
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Master New Skills
              <span className="block text-blue-200">Learn From Experts</span>
            </h1>
            
            <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-lg leading-relaxed">
              Join our community of learners. Access quality courses from experienced professionals and advance your career at your own pace.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-sm sm:text-lg px-4 sm:px-8 py-4 sm:py-6 rounded-full group">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-2 border-white/30 bg-white/30 text-white hover:bg-white/10 text-sm sm:text-lg px-4 sm:px-8 py-4 sm:py-6 rounded-full">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-8 border-t border-white/20">
              {stats.map((stat, index) => {
              const Icon = stat.icon;
              return <div key={stat.label} className="text-center animate-scale-in" style={{
                animationDelay: `${index * 0.15}s`
              }}>
                    <div className="inline-flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/10 mb-2">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
                    </div>
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold">{stat.value}</div>
                    <div className="text-xs sm:text-xs md:text-sm text-white/70">{stat.label}</div>
                  </div>;
            })}
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative hidden lg:block animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <div className="relative">
              {/* Main image container */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img alt="Students learning together" className="w-full h-[500px] object-cover" src="/images/752faa04-d836-41c8-b87a-53c509bb9b86.jpg" />
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
              
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-float z-20" style={{
              animationDelay: '1s'
            }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Join</div>
                    <div className="font-bold text-foreground">8K+ Students</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;