import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/types";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import ContactDetail from "./pages/ContactDetail";
import Reminders from "./pages/Reminders";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

// Get the base path for React Router
const basename = import.meta.env.PROD ? '/hello-warmly' : '';

const App = () => {
  // Check if user has completed onboarding with reactive state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => localStorage.getItem(STORAGE_KEYS.CHECK_IN_USER) !== null
  );

  // Listen for localStorage changes
  useEffect(() => {
    const checkOnboardingStatus = () => {
      setHasCompletedOnboarding(localStorage.getItem(STORAGE_KEYS.CHECK_IN_USER) !== null);
    };

    // Initialize dark mode on app load
    const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

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
            <Route path="/chat" element={<Chat />} />
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
