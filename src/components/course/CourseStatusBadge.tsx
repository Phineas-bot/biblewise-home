
import { Lock, CheckCircle, Clock } from "lucide-react";
import { BookCourse } from "@/types/course";

interface CourseStatusBadgeProps {
  status: BookCourse['status'];
  isNew: boolean;
}

const CourseStatusBadge = ({ status, isNew }: CourseStatusBadgeProps) => {
  switch (status) {
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
      return isNew ? (
        <div className="absolute top-3 right-3 bg-bible-gold/80 text-white text-xs font-medium py-1 px-2 rounded-full">
          New
        </div>
      ) : null;
  }
};

export default CourseStatusBadge;
