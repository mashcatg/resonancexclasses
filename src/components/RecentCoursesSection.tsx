import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty_level: string | null;
  price: number;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  created_at: string;
}

const RecentCoursesSection = () => {
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, description, category, difficulty_level, price, thumbnail_url, duration_minutes, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (data) {
        setRecentCourses(data);
      }
    };

    fetchRecentCourses();
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Recent Courses
            </h2>
            <p className="text-muted-foreground mt-2">
              Stay updated with the latest content added to our platform
            </p>
          </div>
          <Link to="/courses" className="mt-4 md:mt-0">
            <Button variant="link" className="group p-0 h-auto font-semibold text-primary hover:no-underline">
              View All New Courses
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentCourses.map((course) => (
            <div 
              key={course.id} 
              className="group flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:bg-accent/5"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="relative w-28 h-20 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-secondary/50 text-secondary-foreground/80 truncate max-w-[120px]">
                    {course.category || "General"}
                  </Badge>
                </div>
                <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {course.difficulty_level || "All Levels"} • ৳{course.price.toLocaleString()}
                </p>
              </div>

              <div className="flex-shrink-0 pr-2">
                 <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentCoursesSection;
