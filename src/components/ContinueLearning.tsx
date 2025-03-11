
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const courses = [
  {
    id: 1,
    title: "The School of Prayer",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    progress: 65,
    currentLesson: "Principles of Intercession",
    duration: "10 min remaining"
  },
  {
    id: 2,
    title: "Spiritual Leadership",
    image: "https://images.unsplash.com/photo-1507131924971-8b1f886c8549?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    progress: 32,
    currentLesson: "Character Formation",
    duration: "15 min remaining"
  },
  {
    id: 3,
    title: "Biblical Fasting",
    image: "https://images.unsplash.com/photo-1579621970590-9d624316781b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    progress: 18,
    currentLesson: "Types of Biblical Fasts",
    duration: "20 min remaining"
  }
];

const ContinueLearning = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-bible-navy">Continue Your Studies</h2>
          <Button variant="link" className="text-bible-blue">
            View All Courses
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <Progress value={course.progress} className="w-2/3 h-2 bg-white/30" />
                  <span className="text-xs text-white font-medium">{course.progress}%</span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg text-bible-navy mb-2">{course.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.currentLesson}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <Button className="w-full bg-bible-navy hover:bg-bible-blue">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContinueLearning;
