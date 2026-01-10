import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeroSettings {
  main_heading: string;
  sub_heading: string;
  highlighted_text: string;
  description: string;
  button_text: string;
  hero_image_url: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  stat_4_value: string;
  stat_4_label: string;
  community_badge: string;
  community_title: string;
  community_subtitle: string;
  award_icon: string;
  award_title: string;
  award_subtitle: string;
  flag_icon: string;
  flag_title: string;
  flag_subtitle: string;
}

const defaultSettings: HeroSettings = {
  main_heading: "Unlock Your Potential",
  sub_heading: "with",
  highlighted_text: "ResonanceX Classes.",
  description: "Join our expert-led courses designed to help you excel in your academic and professional journey.",
  button_text: "Explore Classes",
  hero_image_url: "https://img.freepik.com/free-photo/school-boy-with-book-park_23-2148199240.jpg?semt=ais_se_enriched&w=740&q=80",
  stat_1_value: "8,000+",
  stat_1_label: "Active Students",
  stat_2_value: "15+",
  stat_2_label: "Total Courses",
  stat_3_value: "20+",
  stat_3_label: "Instructors",
  stat_4_value: "24/7",
  stat_4_label: "Support",
  community_badge: "8k+",
  community_title: "Join our community",
  community_subtitle: "Start your journey today",
  award_icon: "🏆",
  award_title: "World Best",
  award_subtitle: "Top 10 popular",
  flag_icon: "🇬🇧",
  flag_title: "English",
  flag_subtitle: "20 Popular Courses",
};

const HeroSection = () => {
  const [settings, setSettings] = useState<HeroSettings>(defaultSettings);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings' as any)
        .select('*')
        .single();

      if (data && !error) {
        setSettings(data as unknown as HeroSettings);
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      // Use default settings if fetch fails
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-20 lg:pt-0">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-bl-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-secondary/20 rounded-tr-full -z-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              {settings.main_heading} <br />
              {settings.sub_heading} <br />
              <span className="relative inline-block">
                {settings.highlighted_text}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {settings.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-primary text-primary-foreground h-10 px-6 sm:h-12 sm:px-8 rounded-full text-sm sm:text-base font-semibold transition-all">
                  {settings.button_text}
                </Button>
              </Link>
            </div>

            {/* Stats with Avatars */}
            <div className="pt-8 border-t border-border/50 mt-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-background w-10 h-10">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="w-10 h-10 rounded-full  flex items-center justify-center border-2 border-background text-xs font-bold bg-primary text-white relative z-10">
                    {settings.community_badge}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-foreground">{settings.community_title}</p>
                  <p className="text-sm text-muted-foreground">{settings.community_subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{settings.stat_1_value}</h3>
                  <p className="text-sm text-muted-foreground">{settings.stat_1_label}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{settings.stat_2_value}</h3>
                  <p className="text-sm text-muted-foreground">{settings.stat_2_label}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{settings.stat_3_value}</h3>
                  <p className="text-sm text-muted-foreground">{settings.stat_3_label}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{settings.stat_4_value}</h3>
                  <p className="text-sm text-muted-foreground">{settings.stat_4_label}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Image with Square Frame */}
          <div className="flex-1 relative w-full max-w-xl lg:max-w-none flex justify-center lg:justify-end">
            <div className="relative w-[350px] h-[350px] sm:w-[450px] sm:h-[450px]">
              {/* Primary Square Background */}
              <div className="absolute inset-0 rounded-2xl bg-primary transform translate-x-4 translate-y-4 opacity-20" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/80 to-primary overflow-hidden border-8 border-background">
                <img 
                  src={settings.hero_image_url} 
                  alt="resonancexclasses" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 right-0 bg-card p-3 rounded-xl animate-float border border-border/50" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    {settings.award_icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{settings.award_title}</p>
                    <p className="text-[10px] text-muted-foreground">{settings.award_subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -left-4 bg-card p-3 rounded-xl animate-float border border-border/50" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    {settings.flag_icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{settings.flag_title}</p>
                    <p className="text-[10px] text-muted-foreground">{settings.flag_subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Decorative Icons */}
              <div className="absolute -top-8 left-10 w-12 h-12 bg-secondary rounded-lg rotate-12 flex items-center justify-center text-2xl animate-bounce-slow text-secondary-foreground">
                📒
              </div>
              <div className="absolute bottom-10 -right-8 w-10 h-10 bg-background rounded-full flex items-center justify-center text-xl animate-pulse border border-border">
                ✏️
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;