import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import ContactDetail from "./pages/ContactDetail";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Get the base path for React Router
const basename = import.meta.env.PROD ? '/hello-warmly' : '';

const App = () => {
  // Check if user has completed onboarding with reactive state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => localStorage.getItem("checkInUser") !== null
  );

  // Listen for localStorage changes
  useEffect(() => {
    const checkOnboardingStatus = () => {
      setHasCompletedOnboarding(localStorage.getItem("checkInUser") !== null);
    };

    // Check immediately
    checkOnboardingStatus();

    // Listen for storage events (when localStorage changes)
    window.addEventListener('storage', checkOnboardingStatus);
    
    // Custom event for same-tab localStorage changes
    window.addEventListener('localStorageChange', checkOnboardingStatus);

    return () => {
      window.removeEventListener('storage', checkOnboardingStatus);
      window.removeEventListener('localStorageChange', checkOnboardingStatus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <Routes>
            <Route 
              path="/" 
              element={
                hasCompletedOnboarding ? <Navigate to="/home" replace /> : <Navigate to="/onboarding" replace />
              } 
            />
            <Route 
              path="/home" 
              element={
                hasCompletedOnboarding ? <Home /> : <Navigate to="/onboarding" replace />
              } 
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/contact/:id" element={<ContactDetail />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
