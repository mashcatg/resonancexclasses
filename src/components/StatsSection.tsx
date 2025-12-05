import { BookOpen, Users, Award, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "33K+",
      label: "Active Students",
      description: "Learning worldwide",
    },
    {
      icon: BookOpen,
      number: "500+",
      label: "Expert Courses",
      description: "Across all categories",
    },
    {
      icon: Award,
      number: "95%",
      label: "Success Rate",
      description: "Student satisfaction",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support",
      description: "Always available",
    },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-white font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-white/70">
                  {stat.description}
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
