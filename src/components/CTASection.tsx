import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-primary px-6 pt-16 pb-0 sm:px-12 sm:pt-12 shadow-none">
          {/* Background Pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Right side concentric circles/blobs */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] opacity-20">
              <div className="absolute inset-0 rounded-full bg-white/10 scale-100" />
              <div className="absolute inset-[10%] rounded-full bg-white/10 scale-90" />
              <div className="absolute inset-[20%] rounded-full bg-white/10 scale-75" />
              <div className="absolute inset-[30%] rounded-full bg-white/10 scale-60" />
              <div className="absolute inset-[40%] rounded-full bg-white/10 scale-45" />
            </div>
            
            {/* Left side subtle glow */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 lg:gap-12">
            <div className="max-w-2xl text-center lg:text-left pb-8 lg:pb-24">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-6 tracking-tight text-white">
                Start Your 2026 Journey with RCA
              </h2>
              <p className="text-xs sm:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed font-medium">
                Enroll now in our expert-led courses and join thousands of students achieving success
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/login">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-8 py-6 rounded-full font-bold transition-all"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-2 mt-4">
                <a href="tel:+8801521576576" className="text-white/90 text-sm hover:text-white transition-colors flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  +880 1521-576576 (Sujon Sir)
                </a>
                <span className="hidden sm:inline text-white/50">|</span>
                <a href="tel:+8801590097294" className="text-white/90 text-sm hover:text-white transition-colors flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  +880 1590-097294 (Emu Sir)
                </a>
              </div>
            </div>

            <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:w-[400px] lg:h-[400px]">
               <img 
                 src="/cta.png" 
                 alt="Students" 
                 className="relative w-full h-full object-contain"
               />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
