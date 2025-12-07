import { BookOpen, Users, Award, Clock } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "8K+",
      label: "Active Students",
      description: "From across the region",
    },
    {
      icon: BookOpen,
      number: "15+",
      label: "Quality Courses",
      description: "Expert-crafted content",
    },
    {
      icon: Award,
      number: "92%",
      label: "Success Rate",
      description: "Student satisfaction",
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Support",
      description: "Dedicated assistance",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-white/10 mb-2 sm:mb-4">
                  <Icon className="h-5 sm:h-7 w-5 sm:w-7 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-white font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-white/70">
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
