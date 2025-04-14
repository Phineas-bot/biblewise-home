
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BookCourse } from "@/types/course";

interface CourseProgressProps {
  status: BookCourse['status'];
  progress: number;
  lessons: number;
}

const CourseProgress = ({ status, progress, lessons }: CourseProgressProps) => {
  return (
    <>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center">
          <BookOpen className="h-3.5 w-3.5 mr-1" />
          <span>{lessons} lessons</span>
        </div>
        {status !== "locked" && (
          <span className={cn(
            "font-medium",
            status === "completed" ? "text-green-600" : "text-bible-blue"
          )}>
            {progress}% complete
          </span>
        )}
      </div>
      
      {status !== "locked" && (
        <Progress 
          value={progress} 
          className={cn(
            "h-1.5 mb-4",
            status === "completed" ? "bg-green-100" : "bg-bible-sand/50"
          )}
        />
      )}
    </>
  );
};

export default CourseProgress;
