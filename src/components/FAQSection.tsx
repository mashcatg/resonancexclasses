import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How do I get started with a course?",
      answer: "Getting started is easy! Simply browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. You'll be guided through a quick registration and payment process, and then you'll have instant access to the course materials."
    },
    {
      question: "Are the certificates recognized by employers?",
      answer: "Yes, our certificates are highly regarded in the industry. We partner with leading companies to ensure our curriculum meets current market demands. Many of our graduates have successfully used their certificates to secure jobs and promotions."
    },
    {
      question: "Can I learn at my own pace?",
      answer: "Absolutely! All our courses are self-paced, allowing you to learn whenever and wherever it suits you. You have lifetime access to the course content, so you can revisit the materials anytime."
    },
    {
      question: "What kind of support do I get?",
      answer: "We offer comprehensive support. You'll have access to a dedicated community forum where you can ask questions and interact with peers and instructors. Additionally, our support team is available 24/7 to assist with any technical issues."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the course for any reason, simply contact our support team within 30 days of purchase for a full refund, no questions asked."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column - Image */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
               <img 
                 src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop" 
                 alt="FAQ Support" 
                 className="object-cover w-full h-full transition-transform duration-500"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <div className="absolute bottom-6 left-6 right-6 text-white">
                 <p className="font-medium text-sm md:text-lg">"The support team was incredibly helpful in guiding me through the course selection process."</p>
                 <p className="mt-2 text-xs md:text-sm opacity-80">- Sarah J., Web Developer</p>
               </div>
            </div>
          </div>
          
          {/* Right Column - Content & Accordion */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Can't find the answer you're looking for? Reach out to our <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/80">support team</a>.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                  <AccordionTrigger className="text-left text-sm md:text-lg font-medium py-6 hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm md:text-lg leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
