import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function SystemHealth() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const systemComponents = [
    { name: 'AI Processing', status: 'optimal', color: 'success' },
    { name: 'Database', status: 'healthy', color: 'success' },
    { name: 'Camera Network', status: '247/250 Online', color: 'accent' },
    { name: 'Speaker System', status: 'All Zones', color: 'success' }
  ];

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center space-x-2">
          <i className="fas fa-heartbeat text-primary"></i>
          <span>System Health</span>
        </h3>
        
        <div className="space-y-4">
          {systemComponents.map((component, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{component.name}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-${component.color} rounded-full`}></div>
                <span className="text-sm font-medium">{component.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
