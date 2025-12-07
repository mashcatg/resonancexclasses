import { Search, UserPlus, GraduationCap } from "lucide-react";

const JourneySection = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Choose Your Course",
      description: "Browse our extensive catalog of expert-led courses and find the perfect match for your learning goals.",
    },
    {
      number: "02",
      icon: UserPlus,
      title: "Sign Up and Enroll",
      description: "Create your account and enroll in your chosen course with our simple and secure registration process.",
    },
    {
      number: "03",
      icon: GraduationCap,
      title: "Learn and Succeed",
      description: "Access high-quality content, track your progress, and achieve your learning objectives at your own pace.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-xs md:text-md uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-4">
            Your Online Learning Journey Made Easy
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-md">
            Start your learning adventure in three simple steps and unlock your full potential
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative group animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Connector line for desktop */}
                {/* {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )} */}
                
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl md:text-5xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 md:w-14 h-12 md:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-5 md:h-7 w-5 md:w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                  </div>
                  
                  <h3 className="text-md md:text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-md leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
