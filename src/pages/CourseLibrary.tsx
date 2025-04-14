
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseGrid from "@/components/CourseGrid";
import CourseFilters from "@/components/CourseFilters";
import CourseLibraryHeader from "@/components/CourseLibraryHeader";
import { useCourseFilter } from "@/hooks/useCourseFilter";

const CourseLibrary = () => {
  const { activeFilter, courses, handleFilterChange } = useCourseFilter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <CourseLibraryHeader />
        <section className="py-10">
          <div className="container mx-auto px-4">
            <CourseFilters 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
            />
            <CourseGrid courses={courses} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CourseLibrary;
