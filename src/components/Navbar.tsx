import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  BookOpen,
  Search,
  Award,
  DollarSign,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const navLinkVariants = {
  hover: { scale: 1.08, color: "#2563eb" }, // Tailwind bible-blue
  tap: { scale: 0.96 },
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bible-navy/10 bg-white/60 backdrop-blur-lg shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-xl text-bible-navy"
          >
            <BookOpen className="h-6 w-6 text-bible-blue" />
            <span>Bible Correspondence Course</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <motion.div whileHover="hover" whileTap="tap">
            <Link
              to="/courses"
              className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap">
            <Link
              to="/quizzes"
              className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <Search className="h-4 w-4" />
              Quizzes
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap">
            <Link
              to="/certificates"
              className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <Award className="h-4 w-4" />
              Certificates
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap">
            <Link
              to="/plans"
              className="text-bible-navy hover:text-bible-blue font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              Subscription Plans
            </Link>
          </motion.div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-bible-navy border-bible-navy"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-bible-navy border-bible-navy"
                  onClick={() => navigate("/auth")}
                >
                  Log In
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  className="rounded-full bg-bible-navy hover:bg-bible-blue text-white"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden absolute top-[61px] left-0 right-0 bg-white/80 backdrop-blur-lg border-b z-50 shadow-lg transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link
            to="/courses"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
          >
            <BookOpen className="h-5 w-5 text-bible-blue" />
            <span>Courses</span>
          </Link>
          <Link
            to="/quizzes"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
          >
            <Search className="h-5 w-5 text-bible-blue" />
            <span>Quizzes</span>
          </Link>
          <Link
            to="/certificates"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
          >
            <Award className="h-5 w-5 text-bible-blue" />
            <span>Certificates</span>
          </Link>
          <Link
            to="/plans"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
          >
            <DollarSign className="h-5 w-5 text-bible-blue" />
            <span>Subscription Plans</span>
          </Link>
          <hr />
          <div className="flex flex-col space-y-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/auth")}
                >
                  Log In
                </Button>
                <Button
                  className="w-full justify-start bg-bible-navy hover:bg-bible-blue"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
