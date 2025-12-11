import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-20 lg:pt-0">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-bl-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-secondary/20 rounded-tr-full -z-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Unlock Your Potential <br />
              with <br />
              <span className="relative inline-block">
                ResonanceX Classes.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join our expert-led courses designed to help you excel in your academic and professional journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-primary text-primary-foreground h-10 px-6 sm:h-12 sm:px-8 rounded-full text-sm sm:text-base font-semibold transition-all">
                  Explore Classes
                </Button>
              </Link>
            </div>

            {/* Stats with Avatars */}
            <div className="pt-8 border-t border-border/50 mt-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-background w-10 h-10">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="w-10 h-10 rounded-full  flex items-center justify-center border-2 border-background text-xs font-bold bg-primary text-white relative z-10">
                    8k+
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-foreground">Join our community</p>
                  <p className="text-sm text-muted-foreground">Start your journey today</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">8,000+</h3>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">15+</h3>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">20+</h3>
                  <p className="text-sm text-muted-foreground">Instructors</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">24/7</h3>
                  <p className="text-sm text-muted-foreground">Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Image with Circle Mask */}
          <div className="flex-1 relative w-full max-w-xl lg:max-w-none flex justify-center lg:justify-end">
            <div className="relative w-[350px] h-[350px] sm:w-[450px] sm:h-[450px]">
              {/* Primary Circle Background */}
              <div className="absolute inset-0 rounded-full bg-primary transform translate-x-4 translate-y-4 opacity-20" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/80 to-primary overflow-hidden border-8 border-background">
                <img 
                  src="https://img.freepik.com/free-photo/school-boy-with-book-park_23-2148199240.jpg?semt=ais_se_enriched&w=740&q=80" 
                  alt="resonancexclasses" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-0 bg-card p-3 rounded-xl animate-float border border-border/50" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    🏆
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">World Best</p>
                    <p className="text-[10px] text-muted-foreground">Top 10 popular</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -left-4 bg-card p-3 rounded-xl animate-float border border-border/50" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    🇬🇧
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">English</p>
                    <p className="text-[10px] text-muted-foreground">20 Popular Courses</p>
                  </div>
                </div>
              </div>

              {/* Decorative Icons */}
              <div className="absolute -top-8 left-10 w-12 h-12 bg-secondary rounded-lg rotate-12 flex items-center justify-center text-2xl animate-bounce-slow text-secondary-foreground">
                📒
              </div>
              <div className="absolute bottom-10 -right-8 w-10 h-10 bg-background rounded-full flex items-center justify-center text-xl animate-pulse border border-border">
                ✏️
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;