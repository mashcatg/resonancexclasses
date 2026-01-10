import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const [items, setItems] = useState<Array<{name:string; role:string|null; content:string; image_url:string|null}>>([]);
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await (await import("@/integrations/supabase/client")).supabase
          .from('testimonials' as any)
          .select('name, role, content, image_url')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        setItems((data as unknown as Array<{name:string; role:string|null; content:string; image_url:string|null}>) || []);
      } catch (e) {
        // silently ignore; fallback handled below
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">RCA Students Speak Out</h2>
        <p className="text-sm md:text-lg text-muted-foreground">Join the community and hear their stories</p>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {(items.length ? items : [
              { name: 'Student A', role: 'Learner', content: 'Great experience and supportive community.', image_url: null },
              { name: 'Student B', role: 'Learner', content: 'Expert-led courses helped me achieve my goals.', image_url: null },
              { name: 'Student C', role: 'Learner', content: 'Flexible learning at my own pace.', image_url: null },
            ]).map((t, i) => (
              <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <Card className="h-full border-none shadow-sm bg-background hover:shadow-md transition-all duration-300">
                    <CardContent className="flex flex-col justify-between p-8 h-full">
                      <div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                          <Quote className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-foreground/80 mb-6 leading-relaxed text-base italic">"{t.content}"</p>
                      </div>
                      <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                        {t.image_url ? (
                          <img src={t.image_url} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-background shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted ring-2 ring-background" />
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border hover:bg-accent hover:text-accent-foreground"
              onClick={() => api?.scrollPrev()}
              disabled={!api?.canScrollPrev()}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous slide</span>
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    current === index ? "w-8 bg-primary" : "w-2.5 bg-primary/20 hover:bg-primary/40"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border hover:bg-accent hover:text-accent-foreground"
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
