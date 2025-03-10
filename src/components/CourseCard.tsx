
import { BookCourse } from "@/types/course";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Lock, Play, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: BookCourse;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const getStatusBadge = () => {
    switch (course.status) {
      case "locked":
        return (
          <div className="absolute top-3 right-3 bg-gray-800/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Locked</span>
          </div>
        );
      case "completed":
        return (
          <div className="absolute top-3 right-3 bg-green-600/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </div>
        );
      case "in-progress":
        return (
          <div className="absolute top-3 right-3 bg-bible-blue/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>In Progress</span>
          </div>
        );
      default:
        return course.isNew ? (
          <div className="absolute top-3 right-3 bg-bible-gold/80 text-white text-xs font-medium py-1 px-2 rounded-full">
            New
          </div>
        ) : null;
    }
  };

  const getActionButton = () => {
    switch (course.status) {
      case "locked":
        return (
          <Button className="w-full bg-bible-navy hover:bg-bible-blue mt-4">
            Purchase
          </Button>
        );
      case "completed":
        return (
          <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            Review
          </Button>
        );
      case "in-progress":
        return (
          <Button className="w-full bg-bible-blue hover:bg-bible-navy mt-4">
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
        );
      default:
        return (
          <Button className="w-full bg-bible-navy hover:bg-bible-blue mt-4">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        );
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        {getStatusBadge()}
        <div className="absolute top-3 left-3 bg-bible-navy/80 text-white text-xs font-medium py-1 px-2 rounded-full">
          {course.category}
        </div>
        <img 
          src={course.cover} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-bible-navy mb-1">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">by {course.author}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            <span>{course.lessons} lessons</span>
          </div>
          {course.status !== "locked" && (
            <span className={cn(
              "font-medium",
              course.status === "completed" ? "text-green-600" : "text-bible-blue"
            )}>
              {course.progress}% complete
            </span>
          )}
        </div>
        
        {course.status !== "locked" && (
          <Progress 
            value={course.progress} 
            className={cn(
              "h-1.5 mb-4",
              course.status === "completed" ? "bg-green-100" : "bg-bible-sand/50"
            )}
          />
        )}
        
        <p className="text-sm text-gray-700 mb-auto line-clamp-2">{course.description}</p>
        
        {getActionButton()}
      </div>
    </div>
  );
};

export default CourseCard;
