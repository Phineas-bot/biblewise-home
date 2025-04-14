
import { BookCourse } from "@/types/course";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseActionButtonProps {
  status: BookCourse['status'];
  courseId: number;
}

const CourseActionButton = ({ status, courseId }: CourseActionButtonProps) => {
  switch (status) {
    case "locked":
      return (
        <Button className="w-full bg-bible-navy hover:bg-bible-blue mt-4">
          Purchase
        </Button>
      );
    case "completed":
      return (
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 mt-4"
          asChild
        >
          <Link to={`/reader/${courseId}`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Review
          </Link>
        </Button>
      );
    case "in-progress":
      return (
        <Button 
          className="w-full bg-bible-blue hover:bg-bible-navy mt-4"
          asChild
        >
          <Link to={`/reader/${courseId}`}>
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Link>
        </Button>
      );
    default:
      return (
        <Button 
          className="w-full bg-bible-navy hover:bg-bible-blue mt-4"
          asChild
        >
          <Link to={`/reader/${courseId}`}>
            <Play className="h-4 w-4 mr-2" />
            Start
          </Link>
        </Button>
      );
  }
};

export default CourseActionButton;
