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
      name: "Dr. Robert Fox",
      role: "Lead Data Scientist",
      bio: "Ex-Google AI researcher with 15+ years of experience in Machine Learning and Deep Learning.",
      image: "https://i.pravatar.cc/300?img=11"
    },
    {
      name: "Kristin Watson",
      role: "Senior UX Designer",
      bio: "Award-winning designer who has led design teams at major tech startups and Fortune 500 companies.",
      image: "https://i.pravatar.cc/300?img=5"
    },
    {
      name: "Jacob Jones",
      role: "Full Stack Developer",
      bio: "Open source contributor and author of several popular web development frameworks.",
      image: "https://i.pravatar.cc/300?img=3"
    },
    {
      name: "Cody Fisher",
      role: "Digital Marketing Expert",
      bio: "Helped scale multiple SaaS companies to $10M+ ARR through strategic growth marketing.",
      image: "https://i.pravatar.cc/300?img=8"
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Learn from the best</h2>
            <p className="text-lg text-muted-foreground">
              Our instructors are industry experts, researchers, and practitioners who are passionate about teaching.
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
