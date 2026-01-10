import { Search, UserPlus, GraduationCap, ArrowRight } from "lucide-react";

const JourneySection = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Choose Your Direction",
      description: "Explore our Physics and Chemistry courses designed to strengthen concepts and boost exam performance.",
    },
    {
      number: "02",
      icon: UserPlus,
      title: "Learn with Guidance",
      description: "Study with experienced teachers and motivated classmates in batches suited to your academic goals.",
    },
    {
      number: "03",
      icon: GraduationCap,
      title: "Practice, Improve & Succeed",
      description: "Solve problems, attend regular tests, clear doubts, and build confidence for your exams.",
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Side: Header */}
          <div className="lg:w-1/3">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              Start Your Journey with ResonanceX
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground mb-8">
              We've streamlined the process so you can focus on what matters most: learning and excelling.
            </p>
            <button className="group flex items-center text-primary font-semibold hover:text-primary/80 transition-colors">
              Learn more about our process
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Side: Steps */}
          <div className="lg:w-2/3 grid gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative bg-accent/5 border border-border/50 rounded-2xl p-6 sm:p-8 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center transition-colors duration-300">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        <span className="text-4xl font-bold text-primary/20 transition-colors">
                          {step.number}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
