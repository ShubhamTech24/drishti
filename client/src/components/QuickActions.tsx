import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function QuickActions() {
  const { toast } = useToast();

  const handleEmergencyAlert = () => {
    if (confirm('Broadcast emergency alert to all zones? This will notify all pilgrims and volunteers.')) {
      toast({
        title: "Emergency Alert Activated",
        description: "Broadcasting to all zones and mobile devices.",
        variant: "destructive",
      });
    }
  };

  const handleDeployTeams = () => {
    toast({
      title: "Teams Deployed",
      description: "Volunteers have been notified and dispatched.",
    });
  };

  const handleCrowdRouting = () => {
    toast({
      title: "Crowd Routing Activated",
      description: "Alternative paths are being announced to pilgrims.",
    });
  };

  const handleLockdown = () => {
    if (confirm('Activate emergency lockdown protocol? This will restrict access to critical areas.')) {
      toast({
        title: "Lockdown Protocol Activated",
        description: "Emergency lockdown is now in effect.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-card-foreground mb-6 flex items-center space-x-3">
          <i className="fas fa-bolt text-primary"></i>
          <span>Quick Actions • त्वरित कार्य</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Link href="/alerts">
            <Button 
              className="bg-destructive text-destructive-foreground p-4 h-auto flex-col hover:bg-destructive/90 w-full" 
              data-testid="button-emergency-alert"
            >
              <i className="fas fa-bullhorn text-2xl mb-2"></i>
              <div className="text-sm font-bold">Emergency Alert</div>
              <div className="text-xs opacity-80">Broadcast to all zones</div>
            </Button>
          </Link>
          
          <Button 
            className="bg-primary text-primary-foreground p-4 h-auto flex-col hover:bg-primary/90"
            onClick={handleDeployTeams}
            data-testid="button-deploy-teams"
          >
            <i className="fas fa-users-cog text-2xl mb-2"></i>
            <div className="text-sm font-bold">Deploy Teams</div>
            <div className="text-xs opacity-80">Send volunteers</div>
          </Button>
          
          <Button 
            className="bg-accent text-accent-foreground p-4 h-auto flex-col hover:bg-accent/90"
            onClick={handleCrowdRouting}
            data-testid="button-crowd-routing"
          >
            <i className="fas fa-route text-2xl mb-2"></i>
            <div className="text-sm font-bold">Crowd Routing</div>
            <div className="text-xs opacity-80">Guide flow paths</div>
          </Button>
          
          <Button 
            className="bg-secondary text-secondary-foreground p-4 h-auto flex-col hover:bg-secondary/90"
            onClick={handleLockdown}
            data-testid="button-lockdown"
          >
            <i className="fas fa-shield-alt text-2xl mb-2"></i>
            <div className="text-sm font-bold">Lockdown</div>
            <div className="text-xs opacity-80">Emergency protocol</div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
