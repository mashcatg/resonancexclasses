const PartnersSection = () => {
  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&h=225&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&h=225&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&h=225&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&h=225&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&h=225&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&h=225&q=80",
  ];

  return (
    <>
    <section className="py-16 bg-background border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="text-lg font-semibold text-muted-foreground uppercase tracking-widest">
          Trusted by leading companies nationwide
        </p>
      </div>

      <div className="relative flex w-full flex-col gap-8 overflow-hidden">
        {/* First Row - Normal Direction */}
        <div className="flex min-w-full shrink-0 gap-6 animate-marquee items-center">
          {[...images, ...images, ...images].map((img, i) => (
            <div
              key={i}
              className="flex h-10 w-28 md:h-40 md:w-80 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-border/50 transition-all"
            >
              <img
                src={img}
                alt={`Partner ${i}`}
                className="w-full h-full object-cover border-none transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Second Row - Reverse Direction */}
        <div className="flex min-w-full shrink-0 gap-6 animate-marquee-reverse items-center">
          {[...images, ...images, ...images].reverse().map((img, i) => (
            <div
              key={i}
              className="flex h-10 w-28 md:h-40 md:w-80 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-border/50 transition-all"
            >
              <img
                src={img}
                alt={`Partner ${i}`}
                className="w-full h-full object-cover border-none transition-transform duration-500"
              />
            </div>
          ))}
        </div>
        
        {/* Gradient Fade Edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent z-10"></div>
      </div>
    </section>
    </>
    
  );
};

export default PartnersSection;
