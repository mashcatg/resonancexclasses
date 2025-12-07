import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const stats = [
    { value: "92%", label: "Success Rate" },
    { value: "8K+", label: "Students" },
    { value: "2.5K+", label: "Certificates" },
  ];

  const testimonial = {
    quote: "ResonanceX transformed my career. The courses are well-structured, the instructors are world-class, and the learning experience is unmatched. I went from a beginner to landing my dream job in just 6 months!",
    author: "Sarah Johnson",
    role: "Software Engineer at Google",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <span className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">
            Trusted by Learners Worldwide
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-3 sm:p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-colors animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Card */}
          <div className="relative animate-fade-in">
            <div className="absolute -top-4 -left-4 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Quote className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
            </div>
            
            <div className="bg-background rounded-2xl p-6 sm:p-8 border border-border">
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 sm:h-5 w-4 sm:w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground text-base sm:text-lg leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold text-sm sm:text-base text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
