import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import VolunteersPage from "@/pages/volunteers";
import LostAndFoundPage from "@/pages/lost-and-found";
import IncidentsPage from "@/pages/incidents";
import AlertsPage from "@/pages/alerts";
import { DivineVisionPage } from "@/pages/divine-vision";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
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
