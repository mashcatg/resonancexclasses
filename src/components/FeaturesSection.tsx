import { CheckCircle2, Play, Users, Trophy, Shield, Zap } from "lucide-react";
const FeaturesSection = () => {
  const features = [{
    icon: Play,
    title: "Premium Video Content",
    description: "HD quality video lessons with expert instructors explaining complex topics simply."
  }, {
    icon: Users,
    title: "Learn at Your Own Pace",
    description: "Access course materials anytime, anywhere. Learn on your schedule without pressure."
  }, {
    icon: Trophy,
    title: "Track Your Progress",
    description: "Monitor your learning journey with detailed progress tracking and completion certificates."
  }, {
    icon: Shield,
    title: "Secure Learning Platform",
    description: "Your data is protected with enterprise-grade security and privacy measures."
  }, {
    icon: Zap,
    title: "Interactive Quizzes",
    description: "Test your knowledge with engaging quizzes and get instant feedback on your performance."
  }];
  const highlights = ["Expert-led courses from industry professionals", "Lifetime access to all enrolled courses", "Regular content updates and new additions", "Mobile-friendly learning experience"];
  return <section className="py-20 bg-background" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image Grid */}
          <div className="relative animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=400&fit=crop" alt="Students collaborating" className="w-full h-[240px] object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop" alt="Online learning" className="w-full h-[160px] object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img alt="Team discussion" className="w-full h-[160px] object-cover" src="/lovable-uploads/1fb10044-83b2-43d8-a332-5c1324b54e6a.jpg" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=400&fit=crop" alt="Classroom learning" className="w-full h-[240px] object-cover" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg font-semibold">
              10+ Years of Excellence
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <div>
              <span className="w-12 md:w-14 h-12 md:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                Why Choose Us
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4">
                Offering Premier Online Learning Opportunities
              </h2>
              <p className="text-muted-foreground text-lg">
                We provide a world-class learning experience with cutting-edge technology and expert guidance to help you achieve your goals.
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-4">
              {highlights.map((highlight, index) => <div key={index} className="flex items-center gap-3 animate-slide-up" style={{
              animationDelay: `${index * 0.1}s`
            }}>
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{highlight}</span>
                </div>)}
            </div>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {features.slice(0, 4).map((feature, index) => {
              const Icon = feature.icon;
              return <div key={feature.title} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-scale-in" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>;
            })}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;