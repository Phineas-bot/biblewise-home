import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Pastor James Mwangi",
    role: "Ministry Leader, Kenya",
    testimonial:
      "The Christian Way Series transformed not only my personal walk with God but also equipped me to lead my congregation into deeper levels of commitment to Christ. Book 3 on sanctification particularly changed my life.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: 2,
    name: "Sister Mary Okonkwo",
    role: "Women's Ministry Director, Nigeria",
    testimonial:
      "I've read many books on Christian living, but Prof. Fomum's practical approach in The Christian Way Series helped me establish concrete spiritual disciplines I was missing. His insights on prayer have been invaluable.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: 3,
    name: "Dr. Robert Chen",
    role: "Missionary, Malaysia",
    testimonial:
      "As someone working cross-culturally, the principles in The Way of Christian Character provided me with timeless wisdom that transcends cultural differences. This series should be required reading for every believer.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: 4,
    name: "Evangelist Sarah Moyo",
    role: "Bible College Instructor, Zimbabwe",
    testimonial:
      "I've integrated Prof. Fomum's teachings from The Christian Way Series into our curriculum. The systematic progression through essential Christian doctrines and practices has given our students a solid foundation.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
  },
];

const AUTO_SCROLL_INTERVAL = 4000; // ms

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Pause auto-scroll on hover
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pause = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    const resume = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          prev === testimonials.length - 1 ? 0 : prev + 1
        );
      }, AUTO_SCROLL_INTERVAL);
    };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-2">
            Transformed Lives
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from believers around the world whose spiritual journeys have
            been impacted by the teachings of Prof. Z.T. Fomum
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto" ref={containerRef}>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border-bible-navy/20 bg-white shadow-sm hover:bg-bible-sand/10 hover:border-bible-navy/30 md:-left-5"
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="border-bible-sand">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="md:w-1/4 flex-shrink-0">
                          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mx-auto">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="md:w-3/4">
                          <Quote className="h-8 w-8 text-bible-gold/40 mb-2" />
                          <p className="italic text-gray-700 mb-4">
                            "{testimonial.testimonial}"
                          </p>
                          <div>
                            <h4 className="font-semibold text-bible-navy">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border-bible-navy/20 bg-white shadow-sm hover:bg-bible-sand/10 hover:border-bible-navy/30 md:-right-5"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  index === currentIndex
                    ? "bg-bible-navy"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
