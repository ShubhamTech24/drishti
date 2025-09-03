import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Event } from "@shared/schema";
import { Link } from "wouter";

export default function IncidentFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('POST', `/api/events/${eventId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event Acknowledged",
        description: "Incident has been acknowledged.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to acknowledge event.",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'primary';
      case 'medium': return 'accent';
      case 'low': return 'success';
      default: return 'muted';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-destructive';
      case 'high': return 'border-primary';
      case 'medium': return 'border-accent';
      case 'low': return 'border-success';
      default: return 'border-muted';
    }
  };

  return (
    <Card className="spiritual-border shadow-lg sacred-card divine-glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground flex items-center space-x-3 font-vintage text-shadow-golden floating-om">
            <i className="fas fa-exclamation-triangle text-primary divine-glow"></i>
            <span>Live Incidents • घटनाएं</span>
          </h2>
          <Link href="/incidents">
            <Button size="sm" variant="outline" data-testid="button-view-all-incidents">
              <i className="fas fa-eye mr-2"></i>
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto" data-testid="incident-feed">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 pulse-ring"></div>
              <p className="text-muted-foreground">Loading incidents...</p>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-4xl text-success mb-2"></i>
              <p className="text-muted-foreground">No active incidents</p>
              <p className="text-sm text-muted-foreground">All systems operating normally</p>
            </div>
          ) : (
            events.map((event: Event) => (
              <div 
                key={event.id}
                className={`border-l-4 ${getSeverityBorderColor(event.severity)} bg-${getSeverityColor(event.severity)}/5 p-4 rounded-lg`}
                data-testid={`incident-card-${event.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 bg-${getSeverityColor(event.severity)} rounded-full`}></div>
                    <span className={`text-sm font-bold text-${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt || '').toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                  {event.status === 'open' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeMutation.mutate(event.eventId)}
                      disabled={acknowledgeMutation.isPending}
                      data-testid={`button-acknowledge-${event.id}`}
                    >
                      {acknowledgeMutation.isPending ? 'Processing...' : 'Acknowledge'}
                    </Button>
                  )}
                </div>
                <h4 className="font-semibold text-card-foreground mb-1">
                  {event.summary || 'Incident detected'}
                </h4>
                <div className="flex items-center space-x-4 text-xs">
                  <span><i className="fas fa-map-marker-alt mr-1"></i>{event.zoneId || 'Unknown Zone'}</span>
                  <span><i className="fas fa-clock mr-1"></i>{event.kind}</span>
                  {event.assignedTo && (
                    <span><i className="fas fa-user mr-1"></i>Assigned</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
