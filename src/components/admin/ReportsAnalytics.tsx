
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/calendar";
import { Download, FileText } from "lucide-react";

const ReportsAnalytics = () => {
  // Mock data for the charts
  const completionData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Course Completions",
        data: [15, 22, 28, 18, 25, 30, 35, 42, 45, 48, 38, 50],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const engagementData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "User Engagement",
        data: [420, 380, 450, 500, 480, 370, 400],
        backgroundColor: "#10b981",
      },
    ],
  };

  const quizPerformanceData = {
    labels: ["90-100%", "80-89%", "70-79%", "60-69%", "Below 60%"],
    datasets: [
      {
        label: "Quiz Performance",
        data: [25, 35, 20, 15, 5],
        backgroundColor: ["#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef"],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">View and analyze platform performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <CalendarDateRangePicker />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="1">The Way of Life</SelectItem>
              <SelectItem value="2">The Way of Discipleship</SelectItem>
              <SelectItem value="3">The Way of Sanctification</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">2,845</CardTitle>
            <CardDescription>Total Active Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">↑ 18.2%</span> from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">$24,950</CardTitle>
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">↑ 12.5%</span> from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">68.3%</CardTitle>
            <CardDescription>Avg. Completion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">↑ 4.1%</span> from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completion" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="completion">Course Completion</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completion">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Course Completion Rates</CardTitle>
                <CardDescription>Monthly course completion trends over the past year</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-2">
              <BarChart data={completionData} height={350} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Average daily active users by day of week</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-2">
              <BarChart data={engagementData} height={350} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quiz">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Quiz Performance Distribution</CardTitle>
                <CardDescription>Performance breakdown across all quizzes</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-2 flex justify-center">
              <div className="w-full max-w-md">
                <PieChart data={quizPerformanceData} height={350} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
