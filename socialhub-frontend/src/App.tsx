import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import axiosInstance from "@/lib/axiosInstance";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import Posts from "@/pages/Posts";
import ScheduledPosts from "@/pages/ScheduledPosts";
import ConnectedAccounts from "@/pages/ConnectedAccounts";
import ConnectCallback from "@/pages/ConnectCallback";
import Dashboard from "@/pages/Dashboard";
import Drafts from "@/pages/Drafts";
import SocialAuthCallback from "@/pages/SocialAuthCallback";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import CalendarPage from "@/pages/CalendarPage";
import Billing from "@/pages/Billing";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AuthRequired = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Ensures the csrftoken cookie exists before any mutating request is made.
    axiosInstance.get('/csrf/').catch(() => {});
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/dashboard/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/dashboard/scheduled" element={<ProtectedRoute><ScheduledPosts /></ProtectedRoute>} />
          <Route path="/dashboard/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />
          <Route path="/dashboard/accounts" element={<ProtectedRoute><ConnectedAccounts /></ProtectedRoute>} />
          <Route path="/dashboard/accounts/callback/:platform" element={<ProtectedRoute><ConnectCallback /></ProtectedRoute>} />
          <Route path="/dashboard/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/social/success" element={<AuthRequired><SocialAuthCallback /></AuthRequired>} />
          <Route path="/social/error" element={<AuthRequired><SocialAuthCallback /></AuthRequired>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
