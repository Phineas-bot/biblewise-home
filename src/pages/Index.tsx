
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ContinueLearning from "@/components/ContinueLearning";
import RecommendedBooks from "@/components/RecommendedBooks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ContinueLearning />
        <RecommendedBooks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
