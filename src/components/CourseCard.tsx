
import { BookCourse } from "@/types/course";
import CourseStatusBadge from "./course/CourseStatusBadge";
// import CourseActionButton from "./course/CourseActionButton"; // To be replaced
import CourseProgress from "./course/CourseProgress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: BookCourse;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const { user, userPurchases, isLoadingPurchases } = useAuth();
  const navigate = useNavigate();

  const hasAccess = (courseId: number): boolean => {
    if (!userPurchases) return false;

    // Check for an active subscription
    const hasSubscription = userPurchases.some(
      (purchase) => purchase.item_type === "subscription_plan" 
      // Active status is already filtered in AuthContext's fetchUserPurchases
    );
    if (hasSubscription) return true;

    // Check for a direct course purchase
    const hasCoursePurchase = userPurchases.some(
      (purchase) =>
        purchase.item_type === "course" &&
        purchase.item_id === courseId.toString()
    );
    return hasCoursePurchase;
  };

  const handleCTAClick = () => {
    if (hasAccess(course.id)) {
      navigate(`/bookreader/${course.id}`);
    } else {
      // If user not logged in, redirect to auth. Otherwise, subscription plans.
      if (!user) {
        navigate("/auth");
      } else {
        navigate("/subscription-plans");
      }
    }
  };

  let ctaText = "Get Access";
  if (isLoadingPurchases) {
    ctaText = "Loading...";
  } else if (user && hasAccess(course.id)) {
    ctaText = "View Course";
  } else if (!user) {
    ctaText = "Login to View"; // Or "Get Access" if preferred even for logged out users
  }


  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
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
        
        {/* <CourseActionButton status={course.status} courseId={course.id} /> */}
        <Button 
          onClick={handleCTAClick} 
          disabled={isLoadingPurchases}
          className="mt-4 w-full bg-bible-blue hover:bg-bible-blue/90 text-white"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
