
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  BarChart,
  Home,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reports", label: "Reports", icon: BarChart }
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-bold text-bible-navy">Bible LMS Admin</h2>
      </div>
      
      <Separator />
      
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? "bg-bible-navy text-white hover:bg-bible-navy/90" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                <Home className="mr-2 h-5 w-5" />
                Back to Site
              </Button>
            </Link>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebar;
