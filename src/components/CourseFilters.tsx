
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, CheckCircle } from "lucide-react";

interface CourseFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const CourseFilters = ({ activeFilter, onFilterChange }: CourseFiltersProps) => {
  const filters = [
    { id: "all", label: "All Courses" },
    { id: "new", label: "New", icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { id: "popular", label: "Popular", icon: <TrendingUp className="h-4 w-4 mr-2" /> },
    { id: "completed", label: "Completed", icon: <CheckCircle className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {filters.map(filter => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          className={cn(
            "rounded-full",
            activeFilter === filter.id 
              ? "bg-bible-navy hover:bg-bible-blue" 
              : "border-bible-navy/50 text-bible-navy hover:bg-bible-navy hover:text-white"
          )}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.icon}
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default CourseFilters;
