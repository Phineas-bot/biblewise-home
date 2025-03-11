
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AuthorSpotlight from "@/components/AuthorSpotlight";
import ContinueLearning from "@/components/ContinueLearning";
import CourseProgression from "@/components/CourseProgression";
import CourseSeriesGrid from "@/components/CourseSeriesGrid";
import Testimonials from "@/components/Testimonials";
import RecommendedBooks from "@/components/RecommendedBooks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ContinueLearning />
        <CourseSeriesGrid />
        <CourseProgression />
        <AuthorSpotlight />
        <Testimonials />
        <RecommendedBooks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
