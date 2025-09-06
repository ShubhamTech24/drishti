import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import VolunteersPage from "@/pages/volunteers";
import LostAndFoundPage from "@/pages/lost-and-found";
import IncidentsPage from "@/pages/incidents";
import AlertsPage from "@/pages/alerts";
import { DivineVisionPage } from "@/pages/divine-vision";
import UserDashboard from "./pages/user-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import AuthPage from "./pages/auth";
import Landing from "./pages/landing";
import GuestDashboard from "./pages/guest-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Drishti Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/landing" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={GuestDashboard} />
          <Route path="/alerts" component={AlertsPage} />
          <Route path="/divine-vision" component={DivineVisionPage} />
        </>
      ) : (
        <>
          <Route path="/">
            {user?.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
          </Route>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/user-dashboard" component={UserDashboard} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/volunteers" component={VolunteersPage} />
          <Route path="/lost-and-found" component={LostAndFoundPage} />
          <Route path="/incidents" component={IncidentsPage} />
          <Route path="/alerts" component={AlertsPage} />
          <Route path="/divine-vision" component={DivineVisionPage} />
        </>
      )}
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
