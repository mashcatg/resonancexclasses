import { useState, useEffect } from "react";
import { Facebook, Instagram, Youtube, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
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
  const [expandedBio, setExpandedBio] = useState<number | null>(null);

  const instructors = [
    {
      name: "Kamruzzaman Sujon",
      role: "Founder | Resonance CHemistry Care",
      bio: "As a Chemistry mentor, I focus on turning difficult equations into easy-to-understand lessons. I believe in learning through understanding, helping students overcome their fears and excel in the world of science.",
      image: "/instructors/kamruzzaman.jpeg",
      facebook: "https://www.facebook.com/share/1C8wkLtW9e/?mibextid=wwXIfr",
      instagram: "https://www.instagram.com/zaman_sujon?igsh=dnlmODdtazY5ZmVu&utm_source=qr",
      youtube: "https://youtube.com/@kamruzzaman_sujon?si=DKrIhY1il-gjRzsF",
      whatsapp: "8801521576576"
    },
    {
      name: "Imran Emu",
      role: "Founder | CLASS Physics | Physics, Dhaka University",
      bio: "Dedicated to making physics simple, logical, and achievable for HSC and admission students.",
      image: "/instructors/imran.jpeg",
      facebook: "https://www.facebook.com/share/18DBvs9Uz4/?mibextid=wwXIfr",
      instagram: "https://www.facebook.com/share/18DBvs9Uz4/?mibextid=wwXIfr",
      youtube: "https://youtube.com/@classphysicsibe?si=7b6XJMsc1wdl-J6T",
      whatsapp: "8801590097294"
    },
    {
      name: "MD Al Amin Ripon",
      role: "Founder | NumberNest | CSE, MIST",
      bio: "From confusion to clarity - Mathematics mentoring for HSC & Admission students.",
      image: "/instructors/ripon.jpeg",
      facebook: "https://www.facebook.com/share/1Qjme2psHE/?mibextid=wwXIfr",
      instagram: null,
      youtube: null,
      whatsapp: "8801521329880"
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
                    <p className="text-primary font-medium text-sm mb-3 line-clamp-2">{instructor.role}</p>
                    <div className="mb-4">
                      <p className={`text-muted-foreground text-sm ${expandedBio === index ? '' : 'line-clamp-3'}`}>
                        {instructor.bio}
                      </p>
                      {instructor.bio.length > 100 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedBio(expandedBio === index ? null : index);
                          }}
                          className="text-primary text-xs font-medium mt-1 hover:underline"
                        >
                          {expandedBio === index ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex justify-between items-center gap-4 w-full">
                     
                      {instructor.whatsapp && (
                        <a 
                          href={`https://wa.me/${instructor.whatsapp}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-500 hover:text-green-600 flex gap-2 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle className="w-5 h-5" /> Whatsapp
                        </a>
                      )} 
                      <div className="flex justify-end items-center gap-4">
                      {instructor.facebook && (
                        <a href={instructor.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.instagram && (
                        <a href={instructor.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {instructor.youtube && (
                        <a href={instructor.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Youtube className="w-4 h-4" />
                        </a>
                      )}
                      </div>
                      </div>
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
