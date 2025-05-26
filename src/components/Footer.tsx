
import { BookOpen, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-bible-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 font-semibold text-xl text-white mb-4">
              <BookOpen className="h-6 w-6 text-bible-gold" />
              <span>Bible Correspondence Course</span>
            </a>
            <p className="text-white/80 text-sm mb-6">
              Deepening your understanding of Scripture through expert-led courses and resources.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/80 hover:text-bible-gold transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-bible-gold transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-bible-gold transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/80 hover:text-bible-gold transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Courses</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Quizzes</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Certificates</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Books</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Study Groups</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">About</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Our Mission</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Instructors</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Testimonials</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Blog</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Help Center</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">FAQs</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Privacy Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Terms of Service</a></li>
              <li><a href="#" className="text-white/80 hover:text-bible-gold transition-colors animated-underline">Accessibility</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Bible Correspondence Course. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
