
import { BookCourse } from "@/types/course";
import CourseCard from "./CourseCard";

interface CourseGridProps {
  courses: BookCourse[];
}

const CourseGrid = ({ courses }: CourseGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {courses.length > 0 ? (
        courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))
      ) : (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-500">No courses found</h3>
          <p className="text-gray-400 mt-2">Try changing your filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
