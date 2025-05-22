
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  { id: 1, title: "The Way of Salvation", status: "completed" },
  { id: 2, title: "The Way of Discipleship", status: "completed" },
  { id: 3, title: "The Way of Sanctification", status: "in-progress" },
  { id: 4, title: "The way of Obedience", status: "locked" },
  { id: 5, title: "The Way of Christian Character", status: "locked" },
  { id: 6, title: "The Way of Christian Service", status: "locked" },
  { id: 7, title: "The Way of Spiritual Warfare", status: "locked" },
  { id: 8, title: "The Way of Christian Leadership", status: "locked" },
  { id: 9, title: "The Way of Spiritual Power", status: "locked" },
  { id: 10, title: "The Way of Victorious Living", status: "locked" },
  { id: 11, title: "The Way of Intercession", status: "locked" },
  { id: 12, title: "The Way of Spiritual Growth", status: "locked" },
  { id: 13, title: "The Way of Ministry Effectiveness", status: "locked" },
];

const CourseProgression = () => {
  return (
    <section className="py-12 bg-bible-sand/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-bible-navy">The Christian Way Series</h2>
            <p className="text-gray-600 mt-1">A sequential journey through Prof. Fomum's 12-book discipleship course</p>
          </div>
          <Button variant="link" className="text-bible-blue p-0 h-auto mt-2 md:mt-0">
            View Course Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <Card className="border-bible-navy/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              {courses.map((course, index) => (
                <div key={course.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-center">
                    <div 
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full mr-4 shrink-0",
                        course.status === "completed" ? "bg-green-100 text-green-600" : 
                        course.status === "in-progress" ? "bg-bible-blue/10 text-bible-blue" : 
                        "bg-gray-100 text-gray-400"
                      )}
                    >
                      {course.status === "completed" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : course.status === "locked" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 font-medium">Book {course.id}</span>
                          <h3 className={cn(
                            "font-medium",
                            course.status === "locked" ? "text-gray-500" : "text-bible-navy"
                          )}>
                            {course.title}
                          </h3>
                        </div>
                        
                        <Button 
                          variant={course.status === "locked" ? "outline" : "default"}
                          size="sm"
                          className={cn(
                            course.status === "completed" ? "bg-green-600 hover:bg-green-700" :
                            course.status === "in-progress" ? "bg-bible-blue hover:bg-bible-navy" :
                            "border-gray-200 text-gray-400"
                          )}
                          disabled={course.status === "locked"}
                        >
                          {course.status === "completed" ? "Review" : 
                           course.status === "in-progress" ? "Continue" : 
                           "Locked"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CourseProgression;
