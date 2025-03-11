
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, BookOpen, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample course data - in a real app this would come from an API or database
const courses = [
  {
    id: 1,
    title: "The Way of Salvation",
    description: "The foundational course on understanding salvation through Christ and its implications for daily living.",
    status: "available",
    progress: 0,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    free: true
  },
  {
    id: 2,
    title: "The Way of Discipleship",
    description: "Learn the principles of biblical discipleship and how to follow Christ wholeheartedly.",
    status: "locked",
    progress: 0,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    free: false
  },
  {
    id: 3,
    title: "The Way of Sanctification",
    description: "Explore the process of spiritual growth and becoming more like Christ in character and conduct.",
    status: "locked",
    progress: 0,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    free: false
  },
  {
    id: 4,
    title: "The Way of Christian Character",
    description: "Develop godly character traits that reflect Christ's nature in your daily interactions.",
    status: "locked",
    progress: 0,
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
    free: false
  },
];

const CourseSeriesGrid = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-bible-navy mb-3">The Christian Way Series</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive 12-book collection that guides believers through every aspect of Christian life, from salvation to ministry effectiveness.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md border-bible-navy/10 hover:border-bible-navy/30">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-black/60"></div>
                
                {/* Course Status Badge */}
                <div className={cn(
                  "absolute top-3 right-3 py-1 px-2 rounded-full text-xs font-medium",
                  course.status === "locked" ? "bg-gray-800/80 text-white" : 
                  course.free ? "bg-bible-gold/90 text-white" : "bg-bible-navy/80 text-white"
                )}>
                  {course.status === "locked" ? "Coming Soon" : course.free ? "Free Access" : "Premium"}
                </div>
                
                {/* Book Number */}
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="font-bold">Book {course.id}</span>
                </div>
              </div>
              
              <CardContent className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-bible-navy mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{course.description}</p>
                
                <Button 
                  className={cn(
                    "w-full mt-auto",
                    course.status === "locked" ? "bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-not-allowed" :
                    course.free ? "bg-bible-gold hover:bg-bible-gold/80" : "bg-bible-navy hover:bg-bible-blue"
                  )}
                  disabled={course.status === "locked"}
                >
                  {course.status === "locked" ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Coming Soon
                    </>
                  ) : course.progress > 0 ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      {course.free ? "Start Free Course" : "Start Course"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white">
            View All 12 Books in the Series
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CourseSeriesGrid;
