
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, DollarSign, Award } from "lucide-react";

const DashboardOverview = () => {
  // Mock data - would be fetched from an API in a real application
  const stats = {
    totalUsers: 2547,
    freeUsers: 2125,
    paidUsers: 422,
    totalCourses: 12,
    revenue: 42750,
    completionRate: 68
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <Users className="h-5 w-5 text-bible-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
            <div className="mt-1 flex gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                Free: {stats.freeUsers.toLocaleString()}
              </span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                Paid: {stats.paidUsers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Books</CardTitle>
            <BookOpen className="h-5 w-5 text-bible-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
            <div className="mt-1 text-xs text-gray-600">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                The Christian Way Series
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</div>
            <div className="mt-1 text-xs text-gray-600">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                From {stats.paidUsers} paid subscriptions
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
            <Award className="h-5 w-5 text-bible-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="h-2 mt-2" />
            <div className="mt-1 text-xs text-gray-600">Average across all courses</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 border-b border-gray-100 pb-4">
                <div className="rounded-full h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">John Smith (john@example.com)</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-b border-gray-100 pb-4">
                <div className="rounded-full h-10 w-10 bg-green-100 text-green-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-gray-500">$49.99 - Premium Subscription</p>
                  <p className="text-xs text-gray-400">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full h-10 w-10 bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Course completed</p>
                  <p className="text-xs text-gray-500">Book 1: The Way of Life</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">New Users (This Week)</p>
                  <p className="text-sm font-medium">124</p>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Active Users (Daily)</p>
                  <p className="text-sm font-medium">368</p>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Course Starts (This Week)</p>
                  <p className="text-sm font-medium">257</p>
                </div>
                <Progress value={52} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Conversion Rate</p>
                  <p className="text-sm font-medium">16.5%</p>
                </div>
                <Progress value={16.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
