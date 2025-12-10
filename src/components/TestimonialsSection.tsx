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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      content: "The structured learning path helped me transition from a non-tech background to a full-time developer role in just 6 months.",
      image: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Michael Chen",
      role: "Product Designer",
      content: "The quality of instruction is unmatched. Real-world projects and expert feedback made all the difference in my learning journey.",
      image: "https://i.pravatar.cc/150?img=2"
    },
    {
      name: "Emily Davis",
      role: "Data Analyst",
      content: "I love the flexibility. Being able to learn at my own pace while having access to a supportive community is a game changer.",
      image: "https://i.pravatar.cc/150?img=3"
    },
    {
      name: "James Wilson",
      role: "Software Engineer",
      content: "The depth of the courses is impressive. I've taken other online courses, but none compare to the level of detail found here.",
      image: "https://i.pravatar.cc/150?img=4"
    },
    {
      name: "Lisa Anderson",
      role: "UX Researcher",
      content: "A fantastic platform for upskilling. The community support is incredible, and the instructors are always available to help.",
      image: "https://i.pravatar.cc/150?img=5"
    }
  ];

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
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Loved by students worldwide</h2>
        <p className="text-sm md:text-lg text-muted-foreground">Don't just take our word for it. Hear from our community.</p>
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
            {testimonials.map((t, i) => (
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
                        <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-background shadow-sm" />
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
