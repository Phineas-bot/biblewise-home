
import { useState } from "react";
import { Check } from "lucide-react"; // Removed unused icons
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast"; // Corrected import path
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PurchaseDetails {
  item_id: string;
  item_type: "course" | "subscription_plan";
  price_paid: number;
  currency: string;
}

const SubscriptionPlans = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false); // Loading state
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async (planType: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsProcessingCheckout(true);
    let purchaseDetails: PurchaseDetails;

    if (planType === "Single Course") {
      purchaseDetails = {
        item_id: "COURSE_ID_PLACEHOLDER", // As per instructions
        item_type: "course",
        price_paid: 9.99,
        currency: "USD",
      };
    } else if (planType === "Full Access") {
      purchaseDetails = {
        item_id: annualBilling ? "full_access_annual" : "full_access_monthly",
        item_type: "subscription_plan",
        price_paid: annualBilling ? 79.99 : 8.99,
        currency: "USD",
      };
    } else {
      toast({
        title: "Error",
        description: "Invalid plan type selected.",
        variant: "destructive",
      });
      setIsProcessingCheckout(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("record-purchase", {
        body: purchaseDetails,
      });

      if (error) {
        console.error("Edge function invocation error:", error);
        toast({
          title: "Purchase Failed",
          description: `Error: ${error.message || "An unexpected error occurred."}`,
          variant: "destructive",
        });
      } else {
        console.log("Edge function returned:", data);
        toast({
          title: "Purchase Successful!",
          description: "Your access has been updated. Thank you for your purchase.",
        });
        // Optionally, navigate to a confirmation page or user dashboard
        // navigate("/profile"); 
      }
    } catch (e: any) {
      console.error("Unexpected error during checkout:", e);
      toast({
        title: "Purchase Failed",
        description: `An unexpected error occurred: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-bible-navy text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Bible Learning Journey</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200">
              Unlock spiritual growth through structured Bible studies and courses
            </p>
          </div>
        </section>
        
        {/* Pricing Plans */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-bible-navy mb-4">Subscription Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the plan that's right for your spiritual journey
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center mt-8 space-x-3">
                <span className={`text-sm ${!annualBilling ? 'font-medium text-bible-navy' : 'text-gray-500'}`}>
                  Pay Monthly
                </span>
                <button 
                  onClick={toggleBilling}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ backgroundColor: annualBilling ? '#3b5998' : '#d1d5db' }}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      annualBilling ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${annualBilling ? 'font-medium text-bible-navy' : 'text-gray-500'}`}>
                  Pay Annually <span className="text-bible-gold">Save 20%</span>
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Single Course Plan */}
              <Card className="border-bible-gold/20 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-bible-navy">
                    Single Course Purchase
                  </CardTitle>
                  <p className="text-gray-500 font-medium">
                    Perfect for focused study
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-bible-navy">
                      $9.99
                    </div>
                    <p className="text-sm text-gray-500">Per course, one-time payment</p>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Full access to selected course</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Lifetime access to course materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>All quizzes and assessments included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Course completion certificate</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-bible-navy hover:bg-bible-blue"
                    onClick={() => handleCheckout("Single Course")}
                    disabled={isProcessingCheckout}
                  >
                    {isProcessingCheckout ? "Processing..." : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Full Access Plan */}
              <Card className="border-bible-gold shadow-md hover:shadow-lg transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-bible-gold text-white px-3 py-1 text-xs font-bold">
                  BEST VALUE
                </div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-bible-navy">
                    Full Access Subscription
                  </CardTitle>
                  <p className="text-gray-500 font-medium">
                    Complete biblical education
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-bible-navy">
                      {annualBilling ? "$79.99" : "$8.99"}
                    </div>
                    <p className="text-sm text-gray-500">
                      {annualBilling ? "Per year, billed annually" : "Per month, billed monthly"}
                    </p>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span><strong>Unlimited access</strong> to all courses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>New courses as soon as they're published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>All quizzes and assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Access to exclusive webinars and resources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Downloadable study materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-bible-gold mt-0.5 flex-shrink-0" />
                      <span>Premium support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-bible-gold hover:bg-bible-gold/90 text-white"
                    onClick={() => handleCheckout("Full Access")}
                    disabled={isProcessingCheckout}
                  >
                    {isProcessingCheckout ? "Processing..." : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Payment Methods */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-bible-navy mb-6">Secure Payment Options</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <svg className="h-12 w-auto mb-2" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46.2 11.3C42.6 11.3 39.7 14.1 39.7 17.8C39.7 21.5 42.6 24.3 46.2 24.3C49.8 24.3 52.8 21.5 52.8 17.8C52.8 14.1 49.9 11.3 46.2 11.3Z" fill="#0070E0"/>
                  <path d="M78.1 11.3C74.5 11.3 71.6 14.1 71.6 17.8C71.6 21.5 74.5 24.3 78.1 24.3C81.7 24.3 84.7 21.5 84.7 17.8C84.7 14.1 81.8 11.3 78.1 11.3Z" fill="#0070E0"/>
                  <path d="M104.8 12.6V14.1C103.5 12.5 101.7 11.9 99.7 11.9C96.1 11.9 93.1 14.7 93.1 18.4C93.1 22.1 96 24.9 99.7 24.9C101.7 24.9 103.5 24.3 104.8 22.7V24.2H108.5V12.6H104.8ZM100.3 21.5C98.2 21.5 96.7 20.1 96.7 18.3C96.7 16.5 98.2 15.1 100.3 15.1C102.4 15.1 103.9 16.5 103.9 18.3C103.9 20.1 102.4 21.5 100.3 21.5Z" fill="#0070E0"/>
                  <path d="M21.4 11.9C19.3 11.9 17.7 12.7 16.8 14.1V12.6H13.1V24.2H16.8V17.2C16.8 15.6 18 14.7 19.7 14.7C21.5 14.7 22.4 15.6 22.4 17.2V24.2H26.1V16.3C26.1 13.6 24.3 11.9 21.4 11.9Z" fill="#0070E0"/>
                  <path d="M117.9 20.2L113.5 12.6H109.5L116.1 23.8L112.8 30.3H116.7L124 12.6H120.1L117.9 20.2Z" fill="#0070E0"/>
                  <path d="M33.1 11.9C31 11.9 29.3 12.7 28.4 14.1V12.6H24.7V30.3H28.4V22.7C29.3 24.1 31 24.9 33.1 24.9C36.8 24.9 39.7 22.1 39.7 18.4C39.7 14.7 36.8 11.9 33.1 11.9ZM32.4 21.7C30.3 21.7 28.8 20.3 28.8 18.5C28.8 16.7 30.3 15.3 32.4 15.3C34.5 15.3 36 16.7 36 18.5C36 20.3 34.6 21.7 32.4 21.7Z" fill="#0070E0"/>
                  <path d="M59.7 11.9C57.6 11.9 55.9 12.7 55 14.1V12.6H51.3V24.2H55V17.2C55 15.6 56.2 14.7 57.9 14.7C59.7 14.7 60.6 15.6 60.6 17.2V24.2H64.3V16.3C64.3 13.6 62.5 11.9 59.7 11.9Z" fill="#0070E0"/>
                  <path d="M71.6 12.6V14.1C70.7 12.7 69 11.9 66.9 11.9C63.2 11.9 60.3 14.7 60.3 18.4C60.3 22.1 63.2 24.9 66.9 24.9C69 24.9 70.7 24.1 71.6 22.7V24.2H75.3V12.6H71.6ZM67.6 21.7C65.5 21.7 64 20.3 64 18.5C64 16.7 65.5 15.3 67.6 15.3C69.7 15.3 71.2 16.7 71.2 18.5C71.2 20.3 69.7 21.7 67.6 21.7Z" fill="#0070E0"/>
                  <path d="M84.7 12.6V14.1C83.4 12.5 81.5 11.9 79.5 11.9C75.9 11.9 72.9 14.7 72.9 18.4C72.9 22.1 75.8 24.9 79.5 24.9C81.5 24.9 83.4 24.3 84.7 22.7V24.2H88.4V12.6H84.7V12.6ZM80.1 21.5C78 21.5 76.5 20.1 76.5 18.3C76.5 16.5 78 15.1 80.1 15.1C82.2 15.1 83.7 16.5 83.7 18.3C83.7 20.1 82.2 21.5 80.1 21.5Z" fill="#0070E0"/>
                  <path d="M93.1 12.6V3.3H89.4V24.3H93.1V12.6Z" fill="#0070E0"/>
                  <path d="M17.9 5.7H3.9C2.3 5.7 1 7 1 8.6V26.8C1 28.4 2.3 29.7 3.9 29.7H17.9C19.5 29.7 20.8 28.4 20.8 26.8V8.6C20.8 7 19.5 5.7 17.9 5.7Z" fill="#0070E0"/>
                  <path d="M10.9 24.1C14.5 24.1 17.5 21.1 17.5 17.5C17.5 13.9 14.5 10.9 10.9 10.9C7.3 10.9 4.3 13.9 4.3 17.5C4.3 21.1 7.3 24.1 10.9 24.1Z" fill="white"/>
                </svg>
                <span className="text-sm text-gray-600">PayPal</span>
              </div>
              
              <div className="flex flex-col items-center">
                <svg className="h-8 w-auto mb-2" viewBox="0 0 512 131" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="512" height="131" rx="15" fill="white"/>
                  <path d="M61.574 84.592C61.574 91.749 55.511 97.812 48.354 97.812C41.197 97.812 35.134 91.749 35.134 84.592C35.134 77.436 41.197 71.372 48.354 71.372C55.511 71.372 61.574 77.436 61.574 84.592Z" fill="#EB001B"/>
                  <path d="M125.135 84.592C125.135 91.749 119.072 97.812 111.915 97.812C104.758 97.812 98.695 91.749 98.695 84.592C98.695 77.436 104.758 71.372 111.915 71.372C119.072 71.372 125.135 77.436 125.135 84.592Z" fill="#00A2E5"/>
                  <path d="M93.354 48.134V121.051C93.352 121.634 93.242 122.211 93.031 122.75C92.821 123.289 92.513 123.78 92.124 124.198C91.735 124.616 91.272 124.954 90.756 125.194C90.241 125.433 89.684 125.571 89.118 125.6C86.728 125.686 84.356 125.06 82.332 123.8C80.307 122.541 78.714 120.705 77.746 118.538C73.944 118.438 70.167 117.836 66.5 116.746C61.851 120.258 56.028 121.766 50.274 120.996C44.52 120.225 39.321 117.23 35.794 112.619C32.267 108.007 30.697 102.147 31.467 96.393C32.238 90.639 35.233 85.44 39.844 81.913C36.412 70.903 36.985 58.954 41.446 48.337C43.694 48.19 45.936 47.947 48.16 47.609C52.747 32.457 66.468 21.872 82.296 21.872C98.124 21.872 111.845 32.457 116.432 47.609C118.657 47.947 120.898 48.19 123.146 48.337C127.615 58.974 128.178 70.949 124.719 81.973C127.434 84.14 129.624 86.957 131.107 90.192C132.591 93.427 133.326 96.988 133.255 100.585C133.183 104.181 132.307 107.709 130.693 110.878C129.079 114.046 126.772 116.77 123.96 118.819C121.148 120.868 117.907 122.189 114.492 122.672C111.077 123.156 107.593 122.789 104.345 121.603C101.097 120.416 98.176 118.443 95.83 115.865C93.484 113.287 91.78 110.186 90.863 106.812C90.124 104.102 89.87 101.29 90.111 98.497C90.352 95.704 91.084 92.973 92.275 90.43H68.123C68.851 91.796 69.338 93.264 69.671 94.782H90.354C92.065 94.782 92.065 97.447 90.354 97.447H69.935C70.045 98.497 70.1 99.587 70.1 100.677H90.354C92.065 100.677 92.065 103.341 90.354 103.341H69.935C69.642 104.743 69.202 106.109 68.616 107.422H90.354C92.065 107.422 92.065 110.087 90.354 110.087H65.9C62.969 114.744 58.381 118.048 53.06 119.274C47.738 120.5 42.153 119.556 37.584 116.647C33.014 113.737 29.855 109.095 28.814 103.787C27.773 98.478 28.923 93.001 32 88.651C34.994 84.415 39.428 81.512 44.322 80.539C48.63 79.675 53.081 80.166 57.083 81.933C59.749 70.134 58.967 57.661 54.831 46.329C54.831 46.329 58.831 40.872 69.012 40.872H91.695C101.876 40.872 105.876 46.329 105.876 46.329C101.78 57.571 100.969 69.933 103.455 81.649C106.855 80.044 110.64 79.381 114.41 79.731C118.179 80.081 121.779 81.432 124.71 83.598C125.4 84.112 126.035 84.695 126.606 85.34C127.177 85.984 127.679 86.686 128.102 87.433C128.526 88.18 128.868 88.967 129.124 89.782C129.38 90.598 129.548 91.436 129.624 92.284C129.7 93.133 129.684 93.986 129.576 94.832C129.177 97.369 127.976 99.705 126.153 101.507C124.33 103.31 121.98 104.484 119.44 104.851C116.9 105.219 114.307 104.759 112.058 103.545C109.81 102.332 108.025 100.429 107 98.126C106.388 96.779 106.078 95.315 106.093 93.836C106.109 92.357 106.448 90.9 107.086 89.565C107.724 88.23 108.645 87.051 109.784 86.11C110.922 85.17 112.251 84.49 113.677 84.117C113.75 84.097 113.824 84.082 113.899 84.072C112.149 75.372 108.044 67.263 102.024 60.618C102.024 60.618 100.795 60.933 99.54 61.354C94.385 62.889 93.354 66.169 93.354 68.857V48.134ZM93.354 48.134C93.354 48.134 87.354 44.872 80.354 44.872C73.354 44.872 67.354 48.134 67.354 48.134C67.354 48.134 73.354 51.397 80.354 51.397C87.354 51.397 93.354 48.134 93.354 48.134ZM63.116 84.592C63.116 80.977 61.777 77.51 59.392 74.968C57.006 72.426 53.73 70.995 50.276 70.995C46.822 70.995 43.546 72.426 41.16 74.968C38.775 77.51 37.436 80.977 37.436 84.592C37.436 88.208 38.775 91.675 41.16 94.217C43.546 96.759 46.822 98.19 50.276 98.19C53.73 98.19 57.006 96.759 59.392 94.217C61.777 91.675 63.116 88.208 63.116 84.592ZM123.593 84.592C123.593 80.977 122.254 77.51 119.869 74.968C117.483 72.426 114.207 70.995 110.753 70.995C107.299 70.995 104.023 72.426 101.637 74.968C99.252 77.51 97.913 80.977 97.913 84.592C97.913 88.208 99.252 91.675 101.637 94.217C104.023 96.759 107.299 98.19 110.753 98.19C114.207 98.19 117.483 96.759 119.869 94.217C122.254 91.675 123.593 88.208 123.593 84.592Z" fill="url(#paint0_linear_2_120)"/>
                  <path d="M158.4 92.8C157.667 92.8 157.044 92.5507 156.533 92.052C156.022 91.5533 155.767 90.9333 155.767 90.192C155.767 89.4507 156.022 88.8307 156.533 88.332C157.044 87.8333 157.667 87.584 158.4 87.584C159.133 87.584 159.756 87.8333 160.267 88.332C160.778 88.8307 161.033 89.4507 161.033 90.192C161.033 90.9333 160.778 91.5533 160.267 92.052C159.756 92.5507 159.133 92.8 158.4 92.8ZM170.777 70.192C170.777 67.4827 171.276 65.112 172.273 63.08C173.27 61.048 174.654 59.4747 176.425 58.36C178.196 57.2453 180.21 56.688 182.465 56.688C184.497 56.688 186.242 57.0947 187.697 57.908C189.152 58.7213 190.268 59.8107 191.044 61.176V48.4H197.649V83.4H191.044V79.124C190.353 80.5293 189.3 81.6613 187.888 82.52C186.476 83.3787 184.766 83.808 182.777 83.808C180.522 83.808 178.516 83.2507 176.745 82.136C174.974 81 173.58 79.4053 172.561 77.352C171.372 75.0427 170.777 72.732 170.777 70.192ZM191.044 70.248C191.044 68.3867 190.727 66.7707 190.093 65.4C189.458 64.0293 188.619 62.968 187.572 62.216C186.526 61.464 185.361 61.088 184.081 61.088C182.8 61.088 181.645 61.4453 180.617 62.16C179.58 62.8747 178.732 63.9173 178.073 65.288C177.413 66.6587 177.088 68.2373 177.088 70.024C177.088 71.8107 177.413 73.408 178.073 74.816C178.732 76.224 179.58 77.2947 180.617 78.028C181.664 78.7613 182.81 79.128 184.081 79.128C185.361 79.128 186.526 78.7613 187.572 78.028C188.619 77.276 189.458 76.2147 190.093 74.844C190.727 73.4733 191.044 71.9627 191.044 70.248ZM214.393 83.8C212.098 83.8 210.036 83.288 208.209 82.264C206.382 81.24 204.947 79.8 203.905 77.944C202.862 76.088 202.341 73.9413 202.341 71.504C202.341 69.1027 202.872 66.9747 203.933 65.1C204.993 63.2253 206.445 61.7693 208.289 60.744C210.132 59.7187 212.193 59.2053 214.473 59.2C216.753 59.2 218.814 59.7133 220.657 60.744C222.5 61.7747 223.942 63.2307 224.985 65.128C226.028 67.0253 226.549 69.1347 226.549 71.448C226.549 71.6587 226.539 71.8507 226.521 72.024C226.503 72.1973 226.493 72.3893 226.493 72.6H208.701C208.776 73.9707 209.108 75.128 209.697 76.072C210.286 77.016 211.036 77.7413 211.945 78.252C212.854 78.7627 213.848 79.016 214.925 79.016C216.333 79.016 217.598 78.6347 218.721 77.872C219.844 77.1093 220.611 76.1333 221.025 74.944H226.661C226.136 76.76 225.236 78.3573 223.961 79.744C222.686 81.1307 221.142 82.1987 219.329 82.936C217.515 83.6733 215.564 84.0133 213.473 84.0L214.393 83.8ZM214.473 63.9C213.51 63.9 212.622 64.1107 211.809 64.532C210.996 64.9533 210.267 65.5733 209.621 66.392C208.975 67.2107 208.539 68.2427 208.309 69.496H220.217C220.081 68.2787 219.702 67.2467 219.081 66.392C218.46 65.5373 217.713 64.9173 216.837 64.532C215.961 64.1467 215.193 63.9533 214.529 63.9H214.473ZM242.745 83.8C240.45 83.8 238.39 83.288 236.561 82.264C234.733 81.24 233.298 79.8 232.257 77.944C231.214 76.088 230.693 73.9413 230.693 71.504C230.693 69.1027 231.223 66.9747 232.285 65.1C233.346 63.2253 234.797 61.7693 236.641 60.744C238.485 59.7187 240.546 59.2053 242.825 59.2C245.105 59.2 247.166 59.7133 249.009 60.744C250.852 61.7747 252.294 63.2307 253.337 65.128C254.381 67.0253 254.901 69.1347 254.901 71.448C254.901 71.6587 254.891 71.8507 254.873 72.024C254.855 72.1973 254.845 72.3893 254.845 72.6H237.053C237.128 73.9707 237.46 75.128 238.049 76.072C238.638 77.016 239.388 77.7413 240.297 78.252C241.206 78.7627 242.2 79.016 243.277 79.016C244.685 79.016 245.951 78.6347 247.073 77.872C248.196 77.1093 248.963 76.1333 249.377 74.944H255.013C254.488 76.76 253.589 78.3573 252.313 79.744C251.038 81.1307 249.494 82.1987 247.681 82.936C245.866 83.6733 243.915 84.0133 241.825 84.0L242.745 83.8ZM242.825 63.9C241.862 63.9 240.974 64.1107 240.161 64.532C239.348 64.9533 238.618 65.5733 237.973 66.392C237.327 67.2107 236.891 68.2427 236.661 69.496H248.569C248.433 68.2787 248.054 67.2467 247.433 66.392C246.812 65.5373 246.065 64.9173 245.189 64.532C244.313 64.1467 243.545 63.9533 242.881 63.9H242.825ZM263.561 83.4V59.648H269.813V63.08C270.504 61.8 271.476 60.812 272.729 60.116C273.982 59.42 275.36 59.072 276.865 59.072C279.185 59.072 281.067 59.7747 282.513 61.18C283.958 62.5853 284.681 64.532 284.681 67.02V83.4H278.189V68.148C278.189 66.6653 277.85 65.5413 277.169 64.776C276.488 64.0107 275.509 63.628 274.233 63.628C272.938 63.628 271.86 64.0827 270.993 64.992C270.126 65.9013 269.693 67.2333 269.693 68.988V83.4H263.561ZM304.361 59.2C306.84 59.2 309.064 59.7293 311.033 60.788C313.002 61.8467 314.559 63.4253 315.705 65.524C316.852 67.6227 317.425 70.108 317.425 72.98C317.425 75.852 316.852 78.3373 315.705 80.436C314.559 82.5347 313.002 84.1133 311.033 85.172C309.064 86.2307 306.84 86.76 304.361 86.76C301.881 86.76 299.658 86.2307 297.689 85.172C295.72 84.1133 294.162 82.5347 293.017 80.436C291.87 78.3373 291.297 75.852 291.297 72.98C291.297 70.108 291.87 67.6227 293.017 65.524C294.162 63.4253 295.72 61.8467 297.689 60.788C299.658 59.7293 301.881 59.2 304.361 59.2ZM304.361 65.244C302.961 65.244 301.785 65.612 300.833 66.348C299.881 67.084 299.162 68.08 298.673 69.336C298.185 70.592 297.941 71.9893 297.941 73.532C297.941 75.0747 298.185 76.4627 298.673 77.7C299.162 78.9373 299.881 79.9147 300.833 80.62C301.785 81.3253 302.961 81.678 304.361 81.678C305.761 81.678 306.937 81.3253 307.889 80.62C308.841 79.9147 309.56 78.9373 310.049 77.7C310.538 76.4627 310.781 75.0747 310.781 73.532C310.781 71.9893 310.538 70.592 310.049 69.336C309.56 68.08 308.841 67.084 307.889 66.348C306.937 65.612 305.761 65.244 304.361 65.244Z" fill="#1D1D1D"/>
                  <path d="M377.2 74.624C369.136 71.6747 364.725 67.1467 364.725 59.424C364.725 53.1307 370.128 47.952 378.981 47.952C383.808 47.952 387.168 49.424 389.136 50.768C390.352 51.648 390.971 52.9707 390.112 54.1867C389.504 55.0667 388.064 55.2107 386.72 54.5013C384.624 53.2853 382.144 52.4053 379.029 52.4053C374.203 52.4053 370.843 55.448 370.843 59.3333C370.843 63.7947 374.203 66.4 380.085 68.5947C388.384 71.6267 392.293 76.1613 392.293 83.5947C392.293 90.2453 386.528 95.4267 378.773 95.4267C371.936 95.4267 366.208 91.744 365.12 86.8267C364.789 85.3387 365.635 83.968 367.173 83.6373C368.64 83.3067 370.011 84.1013 370.341 85.5307C371.029 88.104 374.53 91.0587 378.773 91.0587C383.728 91.0587 386.213 88.1053 386.213 83.6373C386.213 78.4853 382.677 75.9173 377.2 74.624ZM413.296 95.3333C405.248 95.3333 398.864 88.9493 398.864 80.9013C398.864 72.976 405.248 66.552 413.296 66.552C421.345 66.552 427.729 72.976 427.729 80.9013C427.729 88.9493 421.345 95.3333 413.296 95.3333ZM413.296 70.92C407.743 70.92 403.296 75.3667 403.296 80.9013C403.296 86.5947 407.711 90.9653 413.296 90.9653C418.88 90.9653 423.296 86.5947 423.296 80.9013C423.296 75.3667 418.848 70.92 413.296 70.92ZM445.797 95.3333C437.749 95.3333 431.365 88.9493 431.365 80.9013C431.365 72.976 437.749 66.552 445.797 66.552C453.845 66.552 460.229 72.976 460.229 80.9013C460.229 88.9493 453.845 95.3333 445.797 95.3333ZM445.797 70.92C440.245 70.92 435.797 75.3667 435.797 80.9013C435.797 86.5947 440.213 90.9653 445.797 90.9653C451.381 90.9653 455.797 86.5947 455.797 80.9013C455.797 75.3667 451.349 70.92 445.797 70.92ZM466.229 94.7547C464.789 94.7547 463.637 93.604 463.637 92.164V56.6907C463.637 55.208 464.789 54.0573 466.229 54.0573C467.669 54.0573 468.821 55.208 468.821 56.6907V80.288L483.189 67.3627C484.133 66.4827 485.624 66.48 486.565 67.3613C487.509 68.2413 487.512 69.7307 486.629 70.6747L477.032 79.4413L487.616 91.3147C488.432 92.28 488.305 93.76 487.331 94.576C486.365 95.392 484.885 95.2213 484.069 94.5413L472.885 81.7733L468.821 85.8 468.821 92.1667C468.821 93.604 467.669 94.7547 466.229 94.7547Z" fill="#1D1D1D"/>
                  <defs>
                  <linearGradient id="paint0_linear_2_120" x1="31.354" y1="73.736" x2="133.372" y2="73.736" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FF5F00"/>
                  <stop offset="1" stop-color="#FF5F00"/>
                  </linearGradient>
                  </defs>
                </svg>
                <span className="text-sm text-gray-600">Credit Cards</span>
              </div>
              
              <div className="flex flex-col items-center">
                <svg className="h-8 w-auto mb-2" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.376 5.163C11.99 5.163 11.619 5.271 11.302 5.473C10.985 5.675 10.737 5.963 10.587 6.301C10.437 6.639 10.393 7.014 10.459 7.375C10.526 7.736 10.7 8.066 10.961 8.327C11.222 8.589 11.553 8.762 11.913 8.829C12.274 8.896 12.648 8.851 12.986 8.701C13.324 8.552 13.612 8.304 13.814 7.986C14.016 7.669 14.124 7.299 14.124 6.912C14.124 6.394 13.918 5.898 13.55 5.53C13.183 5.162 12.687 4.956 12.169 4.956L12.376 5.163ZM34.232 13.204C33.845 13.204 33.474 13.313 33.157 13.514C32.84 13.717 32.592 14.004 32.442 14.342C32.293 14.68 32.248 15.055 32.315 15.417C32.381 15.778 32.555 16.107 32.817 16.369C33.078 16.63 33.408 16.804 33.769 16.87C34.13 16.937 34.504 16.893 34.842 16.743C35.18 16.593 35.468 16.346 35.67 16.028C35.872 15.711 35.98 15.34 35.98 14.953C35.98 14.435 35.774 13.939 35.406 13.571C35.039 13.203 34.543 12.997 34.025 12.997L34.232 13.204ZM45.676 5.163C45.289 5.163 44.918 5.271 44.601 5.473C44.284 5.675 44.036 5.963 43.887 6.301C43.737 6.639 43.692 7.014 43.759 7.375C43.825 7.736 43.999 8.066 44.261 8.327C44.522 8.589 44.852 8.762 45.213 8.829C45.574 8.896 45.948 8.851 46.286 8.701C46.624 8.552 46.912 8.304 47.114 7.986C47.316 7.669 47.424 7.299 47.424 6.912C47.424 6.394 47.218 5.898 46.85 5.53C46.483 5.162 45.987 4.956 45.469 4.956L45.676 5.163ZM56.912 13.204C56.526 13.204 56.155 13.313 55.838 13.514C55.521 13.717 55.273 14.004 55.123 14.342C54.973 14.68 54.929 15.055 54.995 15.417C55.062 15.778 55.236 16.107 55.497 16.369C55.759 16.63 56.089 16.804 56.45 16.87C56.811 16.937 57.185 16.893 57.523 16.743C57.861 16.593 58.149 16.346 58.351 16.028C58.553 15.711 58.661 15.34 58.661 14.953C58.661 14.435 58.455 13.939 58.087 13.571C57.719 13.203 57.223 12.997 56.705 12.997L56.912 13.204ZM63.908 0.875H7.468C5.677 0.875 4.233 2.319 4.233 4.11V26.033C4.233 27.824 5.677 29.268 7.468 29.268H63.908C65.699 29.268 67.143 27.824 67.143 26.033V4.11C67.143 2.319 65.699 0.875 63.908 0.875Z" fill="#02AEB5"/>
                  <path d="M13.332 17.773L14.665 13.203H21.977C22.813 13.217 23.622 13.527 24.249 14.077C24.876 14.626 25.283 15.383 25.4 16.209C25.517 17.036 25.335 17.876 24.889 18.573C24.442 19.271 23.76 19.776 22.96 19.994L23.706 22.55C23.777 22.77 23.704 23.012 23.524 23.161L21.777 24.556C21.613 24.69 21.399 24.751 21.188 24.726C20.978 24.701 20.789 24.592 20.666 24.424L18.324 21.155H16.369L15.658 23.581C15.6 23.802 15.436 23.978 15.22 24.053L13.539 24.75C13.345 24.817 13.133 24.807 12.948 24.722C12.763 24.637 12.622 24.484 12.552 24.296L10.334 17.773H13.332ZM16.822 19.09H19.406C20.022 19.09 20.617 18.856 21.076 18.431C21.535 18.006 21.824 17.423 21.885 16.8C21.945 16.179 21.771 15.558 21.397 15.059C21.024 14.56 20.477 14.221 19.869 14.108L16.822 19.09ZM23.125 9.595H23.373C23.744 9.61 24.098 9.493 24.373 9.267C24.648 9.041 24.826 8.722 24.871 8.374C24.915 8.026 24.825 7.676 24.619 7.391C24.413 7.107 24.105 6.911 23.767 6.841L17.346 6.912C16.809 6.893 16.293 7.114 15.926 7.517C15.559 7.92 15.378 8.468 15.431 9.015L15.782 11.326H12.911L10.127 20.092C10.057 20.285 10.069 20.498 10.158 20.681C10.248 20.865 10.407 21.006 10.6 21.074L12.869 21.803C13.042 21.863 13.231 21.858 13.4 21.788C13.57 21.718 13.709 21.587 13.795 21.421L15.08 18.377H21.554L23.063 20.471C23.147 20.587 23.255 20.683 23.378 20.751C23.501 20.819 23.638 20.857 23.777 20.862C23.916 20.866 24.055 20.836 24.182 20.776C24.309 20.715 24.422 20.625 24.513 20.516L25.691 19.053C25.861 18.844 25.941 18.573 25.913 18.303C25.884 18.032 25.751 17.783 25.541 17.613L23.952 16.329C24.603 16.081 25.167 15.649 25.57 15.09C25.973 14.531 26.197 13.866 26.214 13.181C26.23 12.497 26.038 11.821 25.662 11.24C25.287 10.659 24.743 10.198 24.105 9.916C23.807 9.787 23.497 9.688 23.179 9.623L23.125 9.595ZM28.54 24.274C28.298 24.274 28.066 24.18 27.892 24.013C27.719 23.846 27.617 23.618 27.609 23.376L27.289 7.266C27.284 7.14 27.304 7.014 27.347 6.896C27.389 6.778 27.454 6.669 27.539 6.577C27.623 6.484 27.725 6.409 27.838 6.355C27.951 6.302 28.074 6.27 28.2 6.263L32.089 6.099C32.22 6.092 32.352 6.109 32.476 6.148C32.601 6.187 32.715 6.248 32.815 6.328C32.915 6.407 32.999 6.504 33.063 6.613C33.127 6.722 33.169 6.841 33.187 6.965L35.051 17.882L38.298 9.267C38.345 9.156 38.416 9.057 38.504 8.977C38.593 8.897 38.697 8.837 38.811 8.802C38.924 8.766 39.043 8.755 39.161 8.767C39.279 8.78 39.393 8.816 39.495 8.875L43.054 10.92L42.899 6.912C42.893 6.652 42.988 6.399 43.163 6.209C43.338 6.018 43.579 5.9 43.839 5.879L46.932 5.579C47.061 5.569 47.19 5.583 47.311 5.621C47.433 5.658 47.544 5.718 47.639 5.798C47.735 5.877 47.811 5.974 47.866 6.082C47.921 6.19 47.953 6.308 47.96 6.428L48.226 13.232C48.754 12.52 49.535 12.034 50.419 11.874C50.775 11.799 51.14 11.764 51.506 11.769C53.136 11.769 54.368 12.429 55.201 13.749C56.224 15.267 56.47 17.078 56.47 18.089C56.47 19.09 56.197 20.074 55.674 20.925C55.151 21.776 54.4 22.459 53.506 22.895C52.515 23.369 51.419 23.573 50.323 23.488C49.227 23.403 48.173 23.031 47.26 22.404L47.015 23.922C46.977 24.147 46.861 24.351 46.686 24.493C46.511 24.635 46.29 24.705 46.064 24.686L42.749 24.44L40.404 20.516L36.725 24.714C36.562 24.901 36.337 25.015 36.096 25.033C35.856 25.05 35.617 24.969 35.432 24.81L34.025 23.731L33.403 24.038C33.252 24.115 33.083 24.151 32.913 24.143C32.742 24.135 32.578 24.082 32.435 23.991L28.54 24.274ZM47.851 15.212L47.614 20.762C48.063 21.177 48.609 21.466 49.197 21.603C49.786 21.741 50.397 21.723 50.975 21.55C51.317 21.453 51.633 21.281 51.9 21.047C52.167 20.814 52.378 20.524 52.519 20.202C52.658 19.876 52.73 19.524 52.728 19.167C52.725 18.81 52.649 18.458 52.505 18.128C52.361 17.802 52.145 17.513 51.876 17.281C51.607 17.05 51.289 16.881 50.947 16.786C50.448 16.649 49.925 16.634 49.419 16.741C48.913 16.849 48.439 17.076 48.03 17.407L47.851 15.212ZM39.551 14.149L36.894 20.543L38.78 17.151C38.85 17.031 38.949 16.93 39.068 16.856C39.186 16.783 39.321 16.738 39.46 16.727C39.6 16.717 39.739 16.741 39.866 16.798C39.994 16.854 40.106 16.941 40.192 17.05L42.095 19.449L42.417 13.913L39.551 14.149ZM55.282 24.328L58.661 7.857C58.71 7.639 58.832 7.445 59.006 7.311C59.18 7.177 59.395 7.112 59.613 7.128L63.003 7.373C63.198 7.387 63.381 7.469 63.522 7.605C63.662 7.741 63.751 7.923 63.772 8.117L64.447 14.08C65.137 13.267 66.081 12.718 67.118 12.52L67.143 16.154C66.392 16.346 65.716 16.754 65.199 17.329C64.682 17.903 64.348 18.617 64.239 19.376L64.009 22.158C63.988 22.302 63.939 22.44 63.865 22.565C63.791 22.689 63.693 22.796 63.576 22.881C63.459 22.965 63.326 23.024 63.185 23.056C63.044 23.087 62.899 23.09 62.758 23.065L59.858 22.54C59.579 22.495 59.338 22.336 59.195 22.104C59.053 21.872 59.021 21.591 59.108 21.333L59.545 19.567L58.115 19.362L57.127 23.54C57.078 23.758 56.956 23.952 56.782 24.087C56.608 24.221 56.393 24.286 56.175 24.27L55.282 24.328ZM59.135 16.894L59.681 14.817L58.511 14.681L58.361 14.817L58.007 16.758L59.135 16.894Z" fill="white"/>
                  <path d="M77.532 14.008C77.532 15.712 77.02 17.017 75.996 17.922C74.972 18.827 73.56 19.278 71.762 19.278H67.851V8.797H71.762C73.56 8.797 74.972 9.248 75.996 10.153C77.02 11.058 77.532 12.355 77.532 14.008ZM75.673 14.052C75.673 12.844 75.328 11.905 74.639 11.237C73.95 10.569 72.998 10.235 71.791 10.235H69.577V17.879H71.791C72.998 17.879 73.95 17.545 74.639 16.877C75.328 16.209 75.673 15.261 75.673 14.052ZM75.044 0.875L73.201 3.967H72.04L73.487 0.875H75.044Z" fill="#0D3685"/>
                </svg>
                <span className="text-sm text-gray-600">Apple Pay</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-bible-navy mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our subscription plans and payment options
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50">
                    <span className="text-left font-medium text-bible-navy">What happens after I subscribe?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    After subscribing, you'll gain immediate access to all course materials included in your plan. 
                    For the Full Access Subscription, you'll have access to our entire library of courses. 
                    For Single Course purchases, you'll have lifetime access to that specific course materials.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50">
                    <span className="text-left font-medium text-bible-navy">Can I cancel my subscription?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access 
                    until the end of your current billing period. For annual subscriptions, we do not offer partial refunds for 
                    unused months if you cancel mid-term.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50">
                    <span className="text-left font-medium text-bible-navy">Do you offer any free courses?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    Yes! We offer several introductory courses for free to help you get started. These 
                    courses provide a foundation for more advanced studies and give you a taste of our 
                    teaching style before committing to a paid subscription.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50">
                    <span className="text-left font-medium text-bible-navy">Is there a discount for church groups or ministries?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    Absolutely! We offer special group rates for churches, ministries, and Bible study groups. 
                    Please contact our support team at support@biblestudy.example.com for more information about our group 
                    licensing options and discounts.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gray-50">
                    <span className="text-left font-medium text-bible-navy">How do I get my certificate after completing a course?</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    Upon completing all lessons and passing the final assessment with a score of at least 70%, your 
                    certificate will automatically become available for download from your profile page. You can download, 
                    print, or share your certificates digitally.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <Testimonials />
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscriptionPlans;
