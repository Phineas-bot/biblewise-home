
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";

const AuthorSpotlight = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-8 text-center">Author of The Christian Way Series</h2>
        
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-[3/4] max-w-[320px] mx-auto">
              <img 
                src="/lovable-uploads/2a13a5e8-ce37-4d2c-a5ef-d329f4e6e7ee.png" 
                alt="Prof. Zacharias Tanee Fomum" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold">Prof. Zacharias Tanee Fomum</h3>
                  <p className="text-white/90 text-sm">Servant of God (1945-2009)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <h3 className="text-xl font-semibold text-bible-navy mb-3 lg:hidden">Prof. Zacharias Tanee Fomum</h3>
            <p className="text-gray-700 mb-4">
              Prof. Zacharias Tanee Fomum was a professor of Organic Chemistry and a devoted servant of God who authored "The Christian Way Series" - a comprehensive 12-book collection that has guided countless believers through their spiritual journey.
            </p>
            <p className="text-gray-700 mb-4">
              Born in Cameroon, he dedicated his life to discipleship and the proclamation of the Gospel. His teachings on prayer, fasting, spiritual leadership, and holiness continue to transform lives worldwide through his more than 150 books translated into over 50 languages.
            </p>
            <p className="text-gray-700 mb-6">
              The Christian Way Series represents his life's work in distilling biblical principles into practical steps for Christian growth, from salvation to spiritual leadership and ministry effectiveness. His vision was to raise disciples who would walk in the footsteps of Christ.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-bible-navy hover:bg-bible-blue">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore All Books by Prof. Fomum
              </Button>
              <Button variant="outline" className="border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white">
                Learn More About His Life
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSpotlight;
