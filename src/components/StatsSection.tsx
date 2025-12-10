import { BookOpen, Users, Award, Globe } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { label: "Active Students", value: "8,000+", icon: Users },
    { label: "Total Courses", value: "150+", icon: BookOpen },
    { label: "Instructors", value: "50+", icon: Award },
    { label: "Countries", value: "12+", icon: Globe },
  ];

  return (
    <section className="py-10 border-y border-border/50 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
