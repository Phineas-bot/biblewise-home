
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Search, Award, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2 font-semibold text-xl text-bible-navy">
            <BookOpen className="h-6 w-6 text-bible-blue" />
            <span>Bible Correspondence Course</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="/courses" className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Courses
          </a>
          <a href="/quizzes" className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5">
            <Search className="h-4 w-4" />
            Quizzes
          </a>
          <a href="/certificates" className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            Certificates
          </a>
          <a href="/plans" className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            Subscription Plans
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full text-bible-navy border-bible-navy">
            Log In
          </Button>
          <Button className="rounded-full bg-bible-navy hover:bg-bible-blue text-white">
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "md:hidden absolute top-[61px] left-0 right-0 bg-white border-b z-50 shadow-lg transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <a href="/courses" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <BookOpen className="h-5 w-5 text-bible-blue" />
            <span>Courses</span>
          </a>
          <a href="/quizzes" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <Search className="h-5 w-5 text-bible-blue" />
            <span>Quizzes</span>
          </a>
          <a href="/certificates" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <Award className="h-5 w-5 text-bible-blue" />
            <span>Certificates</span>
          </a>
          <a href="/plans" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
            <DollarSign className="h-5 w-5 text-bible-blue" />
            <span>Subscription Plans</span>
          </a>
          <hr />
          <div className="flex flex-col space-y-2">
            <Button variant="outline" className="w-full justify-start">
              Log In
            </Button>
            <Button className="w-full justify-start bg-bible-navy hover:bg-bible-blue">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
