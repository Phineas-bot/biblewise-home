
import { BookCourse } from "@/types/course";
import CourseStatusBadge from "./course/CourseStatusBadge";
import CourseActionButton from "./course/CourseActionButton";
import CourseProgress from "./course/CourseProgress";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CourseCardProps {
  course: BookCourse;
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover-scale flex flex-col h-full">
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <img 
            src={course.cover} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
        </AspectRatio>
        <CourseStatusBadge status={course.status} isNew={course.isNew} />
        <div className="absolute top-3 left-3 bg-bible-navy/80 text-white text-xs font-medium py-1 px-2 rounded-full">
          {course.category}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg text-bible-navy mb-1">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">by {course.author}</p>
        
        <CourseProgress 
          status={course.status}
          progress={course.progress}
          lessons={course.lessons}
        />
        
        <p className="text-sm text-gray-700 mb-auto line-clamp-2">{course.description}</p>
        
        <CourseActionButton status={course.status} courseId={course.id} />
      </div>
    </div>
  );
};

export default CourseCard;
