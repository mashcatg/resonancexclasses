import { Play, Users, Trophy, Smartphone, CheckCircle2 } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full -z-10 opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-2">Everything you need to excel</h2>
          <p className="text-sm md:text-lg text-muted-foreground">
            We provide a comprehensive learning ecosystem designed to help you achieve your goals faster and more effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card - Video Content */}
          <div className="md:col-span-2 bg-card rounded-3xl p-8 border border-border transition-all duration-300 group">
            <div className="h-full flex flex-col justify-between">
              <div className="mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-transform">
                  <Play className="w-7 h-7 text-primary fill-current" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3">Premium Video Content</h3>
                <p className="text-muted-foreground text-sm md:text-lg leading-relaxed">
                  Access hundreds of hours of HD video lessons. Our expert instructors break down complex topics into easy-to-understand segments with real-world examples.
                </p>
              </div>
              
              {/* UI Mockup */}
              <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary fill-current" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-2.5 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-2 bg-muted-foreground/20 rounded w-1/2" />
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent" />
              </div>
            </div>
          </div>

          {/* Tall Card - Certification */}
          <div className="md:row-span-2 bg-primary text-primary-foreground rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 mb-24">
              <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm transition-transform duration-500">
                <Trophy className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3">Certified Learning</h3>
              <p className="text-primary-foreground/90 text-sm md:text-lg leading-relaxed">
                Earn industry-recognized certificates upon completion. Validate your skills and boost your LinkedIn profile to stand out to recruiters.
              </p>
            </div>
            
            {/* Decorative Circles - Blobs from bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-[600px] h-[600px] opacity-20 pointer-events-none">
              <div className="absolute inset-0 rounded-full bg-white/10 scale-100" />
              <div className="absolute inset-[10%] rounded-full bg-white/10 scale-90" />
              <div className="absolute inset-[20%] rounded-full bg-white/10 scale-75" />
              <div className="absolute inset-[30%] rounded-full bg-white/10 scale-60" />
              <div className="absolute inset-[40%] rounded-full bg-white/10 scale-45" />
            </div>
            
            {/* Additional Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-y-1/3 pointer-events-none" />

            <div className="absolute bottom-0 right-0 z-10 max-w-[85%]">
               <img 
                 src="/bento.png" 
                 alt="Certificate" 
                 className="w-full h-[300px] object-cover"
                 style={{ transform: "translate(-90px, 10px)" }}
               />
            </div>
          </div>

          {/* Small Card 1 - Community */}
          <div className="bg-card rounded-3xl p-8 border border-border transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-transform">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community</h3>
            <p className="text-muted-foreground text-sm md:text-lg">Join a global network of learners, share ideas, and grow together.</p>
          </div>

          {/* Small Card 2 - Mobile Friendly */}
          <div className="bg-card rounded-3xl p-8 border border-border transition-all duration-300 group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-transform">
              <Smartphone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
            <p className="text-muted-foreground text-sm md:text-lg">Learn on the go with our fully responsive platform. Any device, anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;