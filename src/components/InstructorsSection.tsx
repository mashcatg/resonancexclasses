import { useState, useEffect } from "react";
import { Linkedin, Twitter, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const InstructorsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const instructors = [
    {
      name: "Kamruzzaman Sujon",
      role: "Founder | RESONANCE Chemistry Academy",
      bio: "As a Chemistry mentor, I focus on turning difficult equations into easy-to-understand lessons. I believe in learning through understanding, helping students overcome their fears and excel in the world of science.",
      image: "/instructors/kamruzzaman.jpg" 
    },
    {
      name: "Imran Emu",
      role: "Founder | CLASS Physics | Physics, Dhaka University",
      bio: "Dedicated to making physics simple, logical, and achievable for HSC and admission students.",
      image: "/instructors/imran.jpg"
    },
    {
      name: "MD Al Amin Ripon",
      role: "Founder | NumberNest | CSE, MIST",
      bio: "Dedicated to making physics simple, logical, and achievable for HSC and admission students.",
      image: "/instructors/ripon.jpg"
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Learn from Teachers Who Make Concepts Easy</h2>
            <p className="text-lg text-muted-foreground">
              Our instructors are expert educators with strong subject knowledge and a passion for teaching.
            </p>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {instructors.map((instructor, index) => (
              <CarouselItem key={index} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/4">
                <div className="group relative overflow-hidden rounded-2xl bg-secondary/20 hover:bg-secondary/30 transition-colors h-full">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={instructor.image} 
                      alt={instructor.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{instructor.name}</h3>
                    <p className="text-primary font-medium text-sm mb-3">{instructor.role}</p>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {instructor.bio}
                    </p>
                    <div className="flex gap-3">
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

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
      </div>
    </section>
  );
};

export default InstructorsSection;
