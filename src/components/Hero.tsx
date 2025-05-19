import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bible-gradient opacity-90"></div>
      </div>

      <div className="container relative mx-auto px-4 text-center md:text-left">
        <div className="mx-auto max-w-4xl md:mx-0">
          <span className="inline-block mb-3 text-white/90 bg-bible-navy/30 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            Welcome to your spiritual journey with Prof. Zacharias Tanee Fomum
          </span>
          <h1 className="mb-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            The Christian Way Series
          </h1>
          <p className="mb-6 text-lg text-white/90 md:text-xl max-w-2xl">
            A systematic Bible course designed to transform believers into
            faithful disciples who walk in the footsteps of Christ.
          </p>
          <blockquote className="mb-8 border-l-4 border-bible-gold pl-4 italic text-white/85 md:mb-10 max-w-3xl">
            "The Christian Way is the way of discipleship, obedience, and
            transformation. The greatest mark of the Holy Spirit in a person's
            life is not the power to perform miracles, but the power to walk
            like Jesus Christ day after day."
            <footer className="mt-2 text-sm text-white/75">
              — Prof. Zacharias Tanee Fomum
            </footer>
          </blockquote>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Button
              size="lg"
              className="button-hover bg-white text-bible-navy hover:bg-bible-sand hover:text-bible-blue"
            >
              Start with Book 1 – Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="button-hover bg-white text-bible-navy hover:bg-bible-sand hover:text-bible-blue"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Explore The Series
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
