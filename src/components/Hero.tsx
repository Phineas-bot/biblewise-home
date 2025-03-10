
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bible-gradient opacity-90"></div>
      </div>
      
      <div className="container relative mx-auto px-4 text-center md:text-left">
        <div className="mx-auto max-w-4xl md:mx-0">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Grow in Faith Through Biblical Knowledge
          </h1>
          <p className="mb-8 text-lg text-white/90 md:text-xl max-w-2xl md:mb-10">
            Deepen your understanding of Scripture with our expert-led courses designed to equip you for your spiritual journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Button size="lg" className="bg-white text-bible-navy hover:bg-bible-sand hover:text-bible-blue">
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
