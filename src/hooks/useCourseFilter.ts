
import { useState } from "react";
import { BookCourse } from "@/types/course";
import { coursesData } from "@/data/courseData";

export const useCourseFilter = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [courses, setCourses] = useState<BookCourse[]>(coursesData);
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === "all") {
      setCourses(coursesData);
    } else if (filter === "new") {
      setCourses(coursesData.filter(course => course.isNew));
    } else if (filter === "popular") {
      setCourses(coursesData.filter(course => course.isPopular));
    } else if (filter === "completed") {
      setCourses(coursesData.filter(course => course.status === "completed"));
    }
  };

  return {
    activeFilter,
    courses,
    handleFilterChange,
  };
};
