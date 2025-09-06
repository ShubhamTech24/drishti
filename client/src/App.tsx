import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import VolunteersPage from "@/pages/volunteers";
import LostAndFoundPage from "@/pages/lost-and-found";
import IncidentsPage from "@/pages/incidents";
import AlertsPage from "@/pages/alerts";
import { DivineVisionPage } from "@/pages/divine-vision";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/volunteers" component={VolunteersPage} />
      <Route path="/lost-and-found" component={LostAndFoundPage} />
      <Route path="/incidents" component={IncidentsPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/divine-vision" component={DivineVisionPage} />
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
