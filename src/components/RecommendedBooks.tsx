
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, BookOpen } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

const books = [
  {
    id: 1,
    title: "The Purpose Driven Life",
    author: "Rick Warren",
    description: "Discover the answer to life's most fundamental question: What on earth am I here for?",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Christian Living"
  },
  {
    id: 2,
    title: "Mere Christianity",
    author: "C.S. Lewis",
    description: "Lewis's forceful and accessible doctrine of Christian belief.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Theology"
  },
  {
    id: 3,
    title: "Knowing God",
    author: "J.I. Packer",
    description: "A journey into the Father's heart, written with simplicity and theological depth.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Theology"
  },
  {
    id: 4,
    title: "The Cost of Discipleship",
    author: "Dietrich Bonhoeffer",
    description: "A compelling case for the necessity of sacrificial Christian service.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Classics"
  },
  {
    id: 5,
    title: "The Reason for God",
    author: "Timothy Keller",
    description: "Making a case for God in an age of skepticism.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Apologetics"
  },
];

const RecommendedBooks = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-12 bg-bible-sand/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-bible-navy">Recommended Books</h2>
          <Button variant="link" className="text-bible-blue">
            Browse Library
          </Button>
        </div>
        
        <div className="relative">
          {/* Left Arrow */}
          <Button 
            variant="secondary" 
            size="icon" 
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-md hover:bg-white transition-opacity duration-300 rounded-full",
              showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll(-300)}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 pb-4 scroll-container hide-scrollbar"
            onScroll={handleScroll}
          >
            {books.map((book) => (
              <div 
                key={book.id}
                className="min-w-[280px] max-w-[280px] bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-bible-navy/80 text-white text-xs font-medium py-1 px-2 rounded-full">
                    {book.category}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg text-bible-navy mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-4 w-4", 
                            i < Math.floor(book.rating) ? "text-bible-gold fill-bible-gold" : "text-gray-300"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{book.rating}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-grow">{book.description}</p>
                  
                  <Button variant="outline" className="w-full border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Arrow */}
          <Button 
            variant="secondary" 
            size="icon" 
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-md hover:bg-white transition-opacity duration-300 rounded-full",
              showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll(300)}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedBooks;
