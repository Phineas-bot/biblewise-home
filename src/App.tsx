
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CourseLibrary from "./pages/CourseLibrary";
import BookReader from "./pages/BookReader";
import QuizPage from "./pages/QuizPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Certificates from "./pages/Certificates";
import PageWrapper from "./components/PageWrapper"; // Import PageWrapper

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
            <Route path="/courses" element={<PageWrapper><CourseLibrary /></PageWrapper>} />
            <Route path="/reader/:id" element={<PageWrapper><BookReader /></PageWrapper>} />
            <Route path="/quiz/:id" element={<PageWrapper><QuizPage /></PageWrapper>} />
            <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/plans" element={<PageWrapper><SubscriptionPlans /></PageWrapper>} />
            <Route path="/certificates" element={<PageWrapper><Certificates /></PageWrapper>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
