import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Award,
  CreditCard,
  BookMarked,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const books = [
  {
    id: 1,
    title: "The Way of Discipleship",
    author: "Prof. Z.T. Fomum",
    description:
      "A comprehensive guide to becoming and making disciples for Christ through practical biblical principles.",
    rating: 4.8,
    image:
      "/uploads/bcc_dis.jpeg",
    category: "Discipleship",
  },
  {
    id: 2,
    title: "The Ministry of Fasting",
    author: "Prof. Z.T. Fomum",
    description:
      "An insightful exploration of biblical fasting and its transformative power in the believer's life.",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Spiritual Disciplines",
  },
  {
    id: 3,
    title: "The Art of Intercession",
    author: "Prof. Z.T. Fomum",
    description:
      "Discover the principles and practice of effective prayer that brings transformation to individuals and nations.",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Prayer",
  },
  {
    id: 4,
    title: "Practical Spiritual Leadership",
    author: "Prof. Z.T. Fomum",
    description:
      "A guide to developing godly leadership skills through character, vision, and spiritual maturity.",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Leadership",
  },
  {
    id: 5,
    title: "The Christian and Money",
    author: "Prof. Z.T. Fomum",
    description:
      "Biblical principles for handling finances with wisdom and integrity as a disciple of Christ.",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    category: "Stewardship",
  },
];

// Future book series data
const upcomingBooks = [
  {
    id: 1,
    title: "The Way of Spiritual Power",
    availability: "Coming March 2024",
  },
  { id: 2, title: "The Way of Service", availability: "Coming May 2024" },
  {
    id: 3,
    title: "The Way of Spiritual Warfare",
    availability: "Coming July 2024",
  },
];

const glassClass =
  "bg-white/60 backdrop-blur-md border border-white/30 shadow-lg";

const RecommendedBooks = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <>
      <section className="py-12 bg-bible-sand/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-bible-navy">
              Featured Books by Prof. Z.T. Fomum
            </h2>
            <Button variant="link" className="text-bible-blue">
              Browse All Books
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
                <motion.div
                  key={book.id}
                  className={cn(
                    "min-w-[280px] max-w-[280px] rounded-xl overflow-hidden flex flex-col transition-shadow duration-300",
                    glassClass,
                    "hover:shadow-2xl"
                  )}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
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
                    <h3 className="font-semibold text-lg text-bible-navy mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {book.author}
                    </p>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(book.rating)
                                ? "text-bible-gold fill-bible-gold"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-grow">
                      {book.description}
                    </p>

                    <Button
                      variant="outline"
                      className="w-full border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </motion.div>
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

      {/* Course Access & Subscription Information */}
      <section className="py-12 bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-3">
              Access The Christian Way Series
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Begin your spiritual journey with the first book for free, then
              continue with our flexible payment options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free Course */}
            <motion.div
              className={cn(
                "rounded-lg flex flex-col items-center text-center",
                glassClass,
                "p-6 border"
              )}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-bible-gold/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-bible-gold" />
              </div>
              <h3 className="text-lg font-semibold text-bible-navy mb-2">
                Start For Free
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                Access "The Way of Salvation" completely free and begin your
                journey.
              </p>
              <Button className="w-full bg-bible-gold hover:bg-bible-gold/80">
                Start Free Course
              </Button>
            </motion.div>

            {/* Individual Books */}
            <motion.div
              className={cn(
                "rounded-lg flex flex-col items-center text-center",
                glassClass,
                "p-6 border shadow-sm"
              )}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-bible-navy/10 rounded-full flex items-center justify-center mb-4">
                <BookMarked className="h-6 w-6 text-bible-navy" />
              </div>
              <h3 className="text-lg font-semibold text-bible-navy mb-2">
                Individual Books
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                Purchase books individually as you progress through the series.
              </p>
              <div className="bg-gray-50 w-full p-3 rounded mb-4">
                <p className="font-medium text-bible-navy">$9.99 per book</p>
              </div>
              <Button
                variant="outline"
                className="w-full border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white"
              >
                View Options
              </Button>
            </motion.div>

            {/* Complete Series */}
            <motion.div
              className={cn(
                "rounded-lg flex flex-col items-center text-center",
                glassClass,
                "p-6 border"
              )}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-bible-blue/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-bible-blue" />
              </div>
              <h3 className="text-lg font-semibold text-bible-navy mb-2">
                Complete Series
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                Get access to all 12 books in The Christian Way Series at a
                discounted rate.
              </p>
              <div className="bg-gray-50 w-full p-3 rounded mb-4">
                <p className="font-medium text-bible-navy">
                  $89.99 for all books
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Save 25% compared to individual purchase
                </p>
              </div>
              <Button className="w-full bg-bible-navy hover:bg-bible-blue">
                Purchase Full Series
              </Button>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <Button variant="link" className="text-bible-blue">
              Learn more about our subscription model
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Books Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-3">
              Coming Soon
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated on future additions to our spiritual library
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {upcomingBooks.map((book) => (
              <motion.div
                key={book.id}
                className={cn(
                  "p-6 rounded-lg flex flex-col",
                  glassClass,
                  "border"
                )}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-semibold text-bible-navy mb-2">
                  {book.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 flex-grow">
                  {book.availability}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-bible-blue border-bible-blue/30 hover:bg-bible-blue/10 mt-auto self-start"
                >
                  Notify Me
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="bg-bible-navy hover:bg-bible-blue">
              Stay Updated on New Releases
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecommendedBooks;
