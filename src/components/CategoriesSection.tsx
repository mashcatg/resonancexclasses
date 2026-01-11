import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const categories = [
  {
    title: "SSC",
    students: "Popular",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "HSC",
    students: "Top Rated",
    image: "https://images.pexels.com/photos/12903123/pexels-photo-12903123.jpeg",
  },
  {
    title: "Admission",
    students: "Trending",
    image: "https://images.pexels.com/photos/6150526/pexels-photo-6150526.jpeg",
  },
];

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

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

  const handleCategoryClick = (categoryTitle: string) => {
    navigate(`/courses?category=${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Left Text Section */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Choose Your Path
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              Excel in SSC, HSC, or Admission tests with expert guidance in Physics, Chemistry & Math.
            </p>
            <Button 
              variant="link" 
              className="group p-0 h-auto font-semibold text-primary hover:no-underline"
              onClick={() => navigate('/courses')}
            >
              Browse All Categories
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Carousel Section */}
          <div className="lg:col-span-3">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {categories.map((category, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div 
                      className="group relative aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer"
                      onClick={() => handleCategoryClick(category.title)}
                    >
                      {/* Background Image */}
                      <img 
                        src={category.image} 
                        alt={category.title}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      {/* Bottom White Box */}
                      <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm p-4 rounded-xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                        {/* <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-secondary text-secondary-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {category.students}
                          </Badge>
                        </div> */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-foreground text-lg">{category.title}</h3>
                          <ArrowRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
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
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
