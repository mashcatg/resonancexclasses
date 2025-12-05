import { BookOpen, Users, Award, TrendingUp, Shield, Zap } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Premium Courses",
      description: "Access world-class courses from industry experts with lifetime updates and support",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from professionals with real-world experience and proven track records",
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Earn recognized certificates upon course completion to boost your career",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics and milestone tracking",
    },
    {
      icon: Shield,
      title: "Secure Learning",
      description: "Advanced anti-cheat systems and secure assessment environment",
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Lightning-fast video streaming and instant access to all course materials",
    },
  ];

  return (
    <section className="py-20 bg-background" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-in">
            Why Choose ResonanceX?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-up">
            Experience the most advanced learning platform designed for modern professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group card-hover bg-card border border-border rounded-xl p-8 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
