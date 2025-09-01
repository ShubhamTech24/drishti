import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    L: any;
  }
}

interface Zone {
  name: string;
  lat: number;
  lng: number;
  density: 'low' | 'medium' | 'high' | 'critical';
  count: number;
}

export default function LiveCrowdMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { data: stats } = useQuery<{totalAttendees?: number}>({
    queryKey: ['/api/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mock zones data - in production this would come from real-time analysis
  const zones: Zone[] = [
    { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885, density: 'critical', count: 2847 },
    { name: 'Mahakal Temple', lat: 23.1825, lng: 75.7685, density: 'high', count: 1523 },
    { name: 'Triveni Sangam', lat: 23.1705, lng: 75.7785, density: 'medium', count: 892 },
    { name: 'Transit Hub-A', lat: 23.1695, lng: 75.7685, density: 'low', count: 234 }
  ];

  useEffect(() => {
    // Load Leaflet script if not already loaded
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = window.L.map(mapRef.current).setView([23.1765, 75.7885], 15);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add zone circles
    zones.forEach(zone => {
      const color = zone.density === 'critical' ? '#DC143C' : 
                   zone.density === 'high' ? '#FF6B35' :
                   zone.density === 'medium' ? '#FFD700' : '#228B22';
                   
      window.L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        radius: zone.count / 2
      }).addTo(map)
      .bindPopup(`<strong>${zone.name}</strong><br>Density: ${zone.density}<br>Count: ${zone.count}`);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded]);

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground flex items-center space-x-3">
            <i className="fas fa-map text-primary"></i>
            <span>Live Crowd Density • भीड़ घनत्व</span>
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Total Pilgrims: <span className="font-bold text-primary" data-testid="text-total-pilgrims">
                {stats?.totalAttendees?.toLocaleString() || '1,247,832'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-fullscreen-map"
            >
              <i className="fas fa-expand-arrows-alt mr-2"></i>Fullscreen
            </Button>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef}
            className="h-96 rounded-lg border-2 border-border overflow-hidden"
            data-testid="map-container"
          >
            {!isMapLoaded && (
              <div className="h-full bg-muted flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-map-marked-alt text-4xl text-muted-foreground mb-2"></i>
                  <p className="text-muted-foreground">Interactive Map Loading...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Heatmap Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 border border-border">
            <h4 className="text-sm font-semibold mb-2 text-card-foreground">Crowd Density</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-success rounded"></div>
                <span className="text-xs">Low (&lt; 0.2)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded"></div>
                <span className="text-xs">Medium (0.2-0.5)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-xs">High (0.5-0.8)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-destructive rounded"></div>
                <span className="text-xs">Critical (&gt; 0.8)</span>
              </div>
            </div>
          </div>

          {/* Zone Stats Overlay */}
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur rounded-lg p-3 border border-border">
            <h4 className="text-sm font-semibold mb-2 text-card-foreground">Active Zones</h4>
            <div className="space-y-1 text-xs">
              {zones.map((zone, index) => (
                <div key={index} className="flex justify-between">
                  <span>{zone.name}:</span>
                  <span className={`font-bold ${
                    zone.density === 'critical' ? 'text-destructive' :
                    zone.density === 'high' ? 'text-primary' :
                    zone.density === 'medium' ? 'text-accent' : 'text-success'
                  }`}>
                    {zone.density.charAt(0).toUpperCase() + zone.density.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
