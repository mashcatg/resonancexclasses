import { BookOpen, Users, Award, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "10K+",
      label: "Active Students",
    },
    {
      icon: BookOpen,
      number: "500+",
      label: "Expert Courses",
    },
    {
      icon: Award,
      number: "95%",
      label: "Success Rate",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stats-card text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
