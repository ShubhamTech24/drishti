import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'live' | 'offline';
  density: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  imageUrl: string;
}

export default function CameraFeedGrid() {
  const { data: sources = [] } = useQuery({
    queryKey: ['/api/sources'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock camera feeds - in production these would be real camera sources
  const mockFeeds: CameraFeed[] = [
    {
      id: 'CAM-01',
      name: 'Ram Ghat - CAM-01',
      zone: 'Ram Ghat',
      status: 'live',
      density: 'critical',
      count: 2847,
      imageUrl: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    },
    {
      id: 'CAM-07',
      name: 'Mahakal - CAM-07',
      zone: 'Mahakal Temple',
      status: 'live',
      density: 'high',
      count: 1523,
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    },
    {
      id: 'CAM-15',
      name: 'Transit-A - CAM-15',
      zone: 'Transit Hub',
      status: 'live',
      density: 'medium',
      count: 892,
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    },
    {
      id: 'CAM-23',
      name: 'Shipra - CAM-23',
      zone: 'Shipra Ghat',
      status: 'live',
      density: 'low',
      count: 234,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
    }
  ];

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-primary text-primary-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground flex items-center space-x-3">
            <i className="fas fa-video text-primary"></i>
            <span>Live Camera Feeds • कैमरा दृश्य</span>
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-view-all-cameras"
            >
              <i className="fas fa-expand mr-1"></i>View All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-camera-settings"
            >
              <i className="fas fa-cog mr-1"></i>Settings
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockFeeds.map((feed) => (
            <div 
              key={feed.id}
              className="relative bg-muted rounded-lg overflow-hidden border border-border"
              data-testid={`camera-feed-${feed.id}`}
            >
              <div className="aspect-video bg-gray-900 relative">
                <img 
                  src={feed.imageUrl}
                  alt={`Live feed from ${feed.name}`}
                  className="w-full h-full object-cover"
                />
                
                <div className={`absolute top-2 left-2 ${getDensityColor(feed.density)} px-2 py-1 rounded text-xs font-bold`}>
                  {feed.density.toUpperCase()}
                </div>
                
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {feed.status.toUpperCase()}
                </div>
                
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {feed.name}
                </div>
                
                <div className={`absolute bottom-2 right-2 ${getDensityColor(feed.density)} px-2 py-1 rounded text-xs`}>
                  <i className="fas fa-users mr-1"></i>{feed.count.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
