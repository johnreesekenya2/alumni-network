import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { authService } from "@/lib/auth";

// Components
import Loader from "@/components/loader";

// Pages
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Verification from "@/pages/verification";
import ProfileSetup from './pages/profile-setup';
import Dashboard from "@/pages/dashboard";
import Database from "@/pages/database";
import Community from "@/pages/community";
import UserProfile from './pages/user-profile';
import Discussion from './pages/discussion';
import Support from './pages/support'; // Import new Support page
import About from './pages/about'; // Import new About page
import Credits from './pages/credits'; // Import new Credits page
import Inbox from './pages/inbox'; // Import new Inbox page
import JobZone from './pages/job-zone'; // Import new Job Zone page
import NotFound from './pages/not-found';

function Router() {
  const [showLoader, setShowLoader] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only show loader on welcome page
    const isWelcomePage = window.location.pathname === '/' || window.location.pathname === '/welcome';
    setShowLoader(isWelcomePage);

    // Check authentication status
    const checkAuth = () => {
      const authState = authService.getState();
      setIsAuthenticated(authState.isAuthenticated);
    };

    checkAuth();

    // Set up auth state listener (simplified for this implementation)
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  if (showLoader && (window.location.pathname === '/' || window.location.pathname === '/welcome')) {
    return <Loader onComplete={() => setShowLoader(false)} />;
  }

  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verification" component={Verification} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/community" component={Community} />


      {/* Protected Routes */}
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/database" component={Database} />
          <Route path="/community" component={Community} />
          <Route path="/profile/:username" component={UserProfile} />
          <Route path="/discussion/:postId" component={Discussion} />
          <Route path="/support" component={Support} />
          <Route path="/about" component={About} />
          <Route path="/credits" component={Credits} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/job-zone" component={JobZone} />
        </>
      ) : (
        <>
          <Route path="/dashboard">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/database">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/community">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/profile/:username">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          {/* Add redirects for new pages if not authenticated */}
          <Route path="/support">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/about">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/credits">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/inbox">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
          <Route path="/job-zone">
            {() => { window.location.href = '/login'; return null; }}
          </Route>
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;