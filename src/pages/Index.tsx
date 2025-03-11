
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AuthorSpotlight from "@/components/AuthorSpotlight";
import ContinueLearning from "@/components/ContinueLearning";
import RecommendedBooks from "@/components/RecommendedBooks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <AuthorSpotlight />
        <ContinueLearning />
        <RecommendedBooks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
