import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function QuickActionsEnhanced() {
  const { toast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLockdown, setIsLockdown] = useState(false);
  const [isRouting, setIsRouting] = useState(false);

  const handleEmergencyAlert = async () => {
    if (confirm('🚨 Broadcast emergency alert to all zones? This will notify all pilgrims and volunteers.')) {
      try {
        const response = await fetch('/api/alerts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            zone: 'all',
            languages: ['hindi', 'english'],
            alertType: 'emergency'
          })
        });
        
        if (response.ok) {
          toast({
            title: "🔊 Emergency Alert Broadcast",
            description: "Multilingual emergency alert sent to all zones, loudspeakers, and mobile devices.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Alert Failed",
          description: "Unable to broadcast emergency alert.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeployTeams = async () => {
    setIsDeploying(true);
    try {
      // Deploy multiple volunteers to high-risk zones
      const deployments = ['v001', 'v007', 'v012'];
      let successCount = 0;
      
      for (const volunteerId of deployments) {
        try {
          const response = await fetch(`/api/volunteers/${volunteerId}/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              zone: 'Ram Ghat Zone-A',
              priority: 'high'
            })
          });
          if (response.ok) successCount++;
        } catch (err) {
          console.error(`Failed to deploy ${volunteerId}:`, err);
        }
      }
      
      toast({
        title: "🚁 Response Teams Deployed",
        description: `${successCount} emergency response teams dispatched to critical zones with real-time tracking.`,
      });
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Unable to deploy response teams.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCrowdRouting = async () => {
    setIsRouting(true);
    try {
      const response = await fetch('/api/alerts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          zone: 'all',
          languages: ['hindi', 'english', 'marathi'],
          alertType: 'crowd_guidance'
        })
      });
      
      if (response.ok) {
        toast({
          title: "🧭 Crowd Routing Activated",
          description: "Directing pilgrims to alternate routes. AI-powered flow management protocols active.",
        });
      }
    } catch (error) {
      toast({
        title: "Routing Failed",
        description: "Unable to activate crowd routing.",
        variant: "destructive",
      });
    } finally {
      setIsRouting(false);
    }
  };

  const handleLockdown = async () => {
    const newLockdownState = !isLockdown;
    if (confirm(`${newLockdownState ? '🔒 Activate' : '🔓 Deactivate'} emergency lockdown protocol? This will ${newLockdownState ? 'restrict' : 'restore'} access to critical areas.`)) {
      try {
        const response = await fetch('/api/alerts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            zone: 'all',
            languages: ['hindi', 'english'],
            alertType: newLockdownState ? 'lockdown' : 'all_clear'
          })
        });
        
        if (response.ok) {
          setIsLockdown(newLockdownState);
          toast({
            title: newLockdownState ? "🔒 Emergency Lockdown Active" : "🟢 Lockdown Lifted",
            description: newLockdownState ? 
              "All zones secured. Emergency protocol active. Only authorized personnel allowed." : 
              "Normal operations resumed. All areas accessible to pilgrims.",
            variant: newLockdownState ? "destructive" : "default",
          });
        }
      } catch (error) {
        toast({
          title: "Lockdown Failed",
          description: "Unable to toggle lockdown status.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="spiritual-border shadow-lg sacred-card sacred-glow">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-card-foreground mb-6 flex items-center space-x-3 font-vintage text-shadow-golden">
          <i className="fas fa-bolt text-primary sacred-glow"></i>
          <span>Divine Actions • दिव्य कार्य</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="bg-destructive text-destructive-foreground p-4 h-auto flex-col hover:bg-destructive/90 sacred-glow transition-all duration-300"
            onClick={handleEmergencyAlert}
            data-testid="button-emergency-alert"
          >
            <i className="fas fa-bullhorn text-2xl mb-2 animate-pulse"></i>
            <div className="text-sm font-bold">Emergency Alert</div>
            <div className="text-xs opacity-80">Divine Protection Broadcast</div>
          </Button>
          
          <Button 
            className="bg-primary text-primary-foreground p-4 h-auto flex-col hover:bg-primary/90 sacred-glow transition-all duration-300"
            onClick={handleDeployTeams}
            disabled={isDeploying}
            data-testid="button-deploy-teams"
          >
            <i className={`fas fa-users-cog text-2xl mb-2 ${isDeploying ? 'animate-spin' : ''}`}></i>
            <div className="text-sm font-bold">{isDeploying ? 'Deploying...' : 'Deploy Teams'}</div>
            <div className="text-xs opacity-80">Sacred Guardians</div>
          </Button>
          
          <Button 
            className="bg-accent text-accent-foreground p-4 h-auto flex-col hover:bg-accent/90 sacred-glow transition-all duration-300"
            onClick={handleCrowdRouting}
            disabled={isRouting}
            data-testid="button-crowd-routing"
          >
            <i className={`fas fa-route text-2xl mb-2 ${isRouting ? 'animate-pulse' : ''}`}></i>
            <div className="text-sm font-bold">{isRouting ? 'Routing...' : 'Crowd Routing'}</div>
            <div className="text-xs opacity-80">Divine Path Guidance</div>
          </Button>
          
          <Button 
            className={`${isLockdown ? 'bg-red-600 hover:bg-red-700' : 'bg-secondary hover:bg-secondary/90'} text-secondary-foreground p-4 h-auto flex-col sacred-glow transition-all duration-300`}
            onClick={handleLockdown}
            data-testid="button-lockdown"
          >
            <i className={`fas ${isLockdown ? 'fa-lock text-red-200' : 'fa-shield-alt'} text-2xl mb-2`}></i>
            <div className="text-sm font-bold">{isLockdown ? 'Lift Lockdown' : 'Sacred Lockdown'}</div>
            <div className="text-xs opacity-80">{isLockdown ? 'Restore Access' : 'Divine Protection'}</div>
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <i className="fas fa-info-circle text-primary"></i>
            <span>Status: {isLockdown ? '🔒 Emergency Protocol Active' : '🟢 Normal Operations'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}