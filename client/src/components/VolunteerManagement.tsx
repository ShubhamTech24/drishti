import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Volunteer } from "@shared/schema";
import { Link } from "wouter";

export default function VolunteerManagement() {
  const { data: volunteers = [], isLoading } = useQuery<Volunteer[]>({
    queryKey: ['/api/volunteers'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'on_break': return 'accent';
      case 'offline': return 'muted';
      default: return 'muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'assigned': return 'En Route';
      case 'on_break': return 'On Break';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  // Mock volunteer data for display
  const mockVolunteers = [
    { id: 'v001', name: 'Volunteer #V001', currentZone: 'Ram Ghat Zone-A', status: 'available', responseTimeAvg: 1.2 },
    { id: 'v007', name: 'Volunteer #V007', currentZone: 'Mahakal Temple', status: 'assigned', responseTimeAvg: 2.1 },
    { id: 'v012', name: 'Volunteer #V012', currentZone: 'Transit Hub-B', status: 'on_break', responseTimeAvg: 1.8 }
  ];

  const displayVolunteers = (volunteers && volunteers.length > 0) ? volunteers : mockVolunteers;

  return (
    <Card className="spiritual-border shadow-lg sacred-card sacred-glow">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center space-x-2">
          <i className="fas fa-users text-primary"></i>
          <span>Volunteer Status • स्वयंसेवक स्थिति</span>
        </h3>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 pulse-ring"></div>
              <p className="text-muted-foreground">Loading volunteers...</p>
            </div>
          ) : (
            displayVolunteers.map((volunteer: any) => (
              <div 
                key={volunteer.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                data-testid={`volunteer-card-${volunteer.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${getStatusColor(volunteer.status)} rounded-full flex items-center justify-center volunteer-badge sacred-glow`}>
                    <i className="fas fa-user text-white"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">{volunteer.name}</div>
                    <div className="text-sm text-muted-foreground">{volunteer.currentZone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium text-${getStatusColor(volunteer.status)}`}>
                    {getStatusText(volunteer.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response: {volunteer.responseTimeAvg || 'N/A'} min
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <Link href="/volunteers">
          <Button 
            className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            data-testid="button-manage-volunteers"
          >
            <i className="fas fa-cog mr-2"></i>
            Manage All Volunteers
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
