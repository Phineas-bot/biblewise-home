import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false); // New state for password reset
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth(); // useAuth's isLoading

  // If auth is still loading, show a generic loading message or spinner
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If user is already logged in, redirect to home page
  if (user) {
    return <Navigate to="/" />;
  }

  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setFullName("");
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields for sign-up.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      toast({
        title: "Sign-up successful!",
        description:
          "Please check your email (including spam folder) for a confirmation link to activate your account.",
        duration: 9000, // Longer duration for this important message
      });

      setIsSignUp(false); // Switch to login form
      resetFormFields(); // Reset fields
    } catch (error: any) {
      toast({
        title: "Sign-up error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful!",
        description: "Welcome back to Bible Correspondence Course.",
      });
      resetFormFields();
      navigate("/"); // Redirect to homepage
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!email) {
      toast({
        title: "Validation Error",
        description: "Email is required to reset password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Or your desired redirect path
      });
      if (error) throw error;
      toast({
        title: "Password Reset Link Sent",
        description: "Please check your email (including spam folder) for a link to reset your password.",
        duration: 9000,
      });
      setIsForgotPasswordMode(false); // Go back to login
      resetFormFields();
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFormMode = (mode: "login" | "signup" | "forgot_password") => {
    resetFormFields();
    if (mode === "signup") {
      setIsSignUp(true);
      setIsForgotPasswordMode(false);
    } else if (mode === "login") {
      setIsSignUp(false);
      setIsForgotPasswordMode(false);
    } else if (mode === "forgot_password") {
      setIsSignUp(false);
      setIsForgotPasswordMode(true);
    }
  };

  const getPageTitle = () => {
    if (isForgotPasswordMode) return "Reset Your Password";
    if (isSignUp) return "Create your account";
    return "Sign in to your account";
  };

  const getButtonText = () => {
    if (isLoading) return "Loading..."; // Consider adding <Loader2 className="mr-2 h-4 w-4 animate-spin" /> here
    if (isForgotPasswordMode) return "Send Reset Link";
    if (isSignUp) return "Sign Up";
    return "Sign In";
  };

  const handleSubmit = () => {
    if (isForgotPasswordMode) {
      handlePasswordResetRequest();
    } else if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 page-fade-in"> {/* Added page-fade-in to the overall container */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8 page-fade-in" style={{animationDelay: "0.1s"}}>
          <div className="inline-flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-bible-blue" />
          </div>
          <h1 className="text-2xl font-bold text-bible-navy">
            Bible Correspondence Course
          </h1>
          <p className="text-gray-600 mt-2">{getPageTitle()}</p>
        </div>

        <div 
          key={isSignUp ? "signup" : isForgotPasswordMode ? "forgot" : "login"} 
          className="bg-white p-8 rounded-lg shadow-md page-fade-in"
          style={{animationDelay: "0.2s"}}
        >
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {isSignUp && (
              <div className="page-fade-in" style={{animationDelay: "0.3s"}}>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="w-full"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            )}

            {!isForgotPasswordMode && (
              <>
                <div className="page-fade-in" style={{animationDelay: isSignUp ? "0.4s" : "0.3s"}}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="email@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="page-fade-in" style={{animationDelay: isSignUp ? "0.5s" : "0.4s"}}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isForgotPasswordMode}
                    className="w-full"
                    placeholder="••••••••"
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {isForgotPasswordMode && (
              <div className="page-fade-in" style={{animationDelay: "0.3s"}}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter your Email Address
                </label>
                <Input
                  id="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-bible-navy hover:bg-bible-blue button-press page-fade-in"
              style={{animationDelay: "0.6s"}}
              disabled={isLoading || isAuthLoading}
            >
              {getButtonText()}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2 page-fade-in" style={{animationDelay: "0.7s"}}>
            {!isForgotPasswordMode && (
              <button
                type="button"
                onClick={() => toggleFormMode(isSignUp ? "login" : "signup")}
                className="text-sm text-bible-blue hover:underline button-press"
                disabled={isLoading}
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </button>
            )}
            {!isSignUp && !isForgotPasswordMode && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleFormMode("forgot_password")}
                  className="text-sm text-bible-blue hover:underline button-press"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            )}
            {isForgotPasswordMode && (
              <button
                type="button"
                onClick={() => toggleFormMode("login")}
                className="text-sm text-bible-blue hover:underline button-press"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
