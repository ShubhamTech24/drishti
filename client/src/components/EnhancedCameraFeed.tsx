import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Source } from "@shared/schema";

interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: 'online' | 'offline' | 'maintenance';
  crowdDensity: 'low' | 'medium' | 'high' | 'critical';
  peopleCount: number;
  lastUpdate: string;
  thumbnail: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export default function EnhancedCameraFeed() {
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: sources = [], isLoading } = useQuery<Source[]>({
    queryKey: ['/api/sources'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Enhanced mock camera feeds with realistic Mahakumbh data
  const mockFeeds: CameraFeed[] = [
    {
      id: 'cam001',
      name: 'Ram Ghat Main Entry',
      zone: 'Ram Ghat Zone-A',
      status: 'online',
      crowdDensity: 'critical',
      peopleCount: 3247,
      riskLevel: 'high',
      lastUpdate: new Date(Date.now() - 30000).toISOString(),
      thumbnail: '/attached_assets/generated_images/Temple_crowd_safety_background_c71524c3.png'
    },
    {
      id: 'cam002', 
      name: 'Mahakal Temple Complex',
      zone: 'Mahakal Temple',
      status: 'online',
      crowdDensity: 'high',
      peopleCount: 1523,
      riskLevel: 'medium',
      lastUpdate: new Date(Date.now() - 45000).toISOString(),
      thumbnail: '/attached_assets/generated_images/Sacred_river_monitoring_background_dcf11067.png'
    },
    {
      id: 'cam003',
      name: 'Triveni Sangam Point',
      zone: 'Triveni Sangam',
      status: 'online', 
      crowdDensity: 'medium',
      peopleCount: 892,
      riskLevel: 'low',
      lastUpdate: new Date(Date.now() - 15000).toISOString(),
      thumbnail: '/attached_assets/generated_images/Mahakumbh_devotee_families_scene_12a2eed8.png'
    },
    {
      id: 'cam004',
      name: 'Transit Hub-A Security',
      zone: 'Transit Hub-A',
      status: 'online',
      crowdDensity: 'low',
      peopleCount: 234,
      riskLevel: 'none',
      lastUpdate: new Date(Date.now() - 60000).toISOString(),
      thumbnail: '/attached_assets/generated_images/Mahakumbh_festival_spiritual_logo_8630bcb7.png'
    },
    {
      id: 'cam005',
      name: 'Medical Zone-C Monitor',
      zone: 'Medical Zone-C',
      status: 'maintenance',
      crowdDensity: 'low',
      peopleCount: 0,
      riskLevel: 'none',
      lastUpdate: new Date(Date.now() - 300000).toISOString(),
      thumbnail: ''
    },
    {
      id: 'cam006',
      name: 'Parking Area-B Overflow',
      zone: 'Parking Zone-B',
      status: 'online',
      crowdDensity: 'high',
      peopleCount: 1847,
      riskLevel: 'medium',
      lastUpdate: new Date(Date.now() - 20000).toISOString(),
      thumbnail: '/attached_assets/generated_images/Sacred_emergency_alert_mandala_28ae0dbf.png'
    }
  ];

  const handleAnalyzeFeed = async (feedId: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis upload
      const formData = new FormData();
      formData.append('source_id', feedId);
      
      // Create a mock file for demonstration
      const mockImageBlob = new Blob(['mock camera frame'], { type: 'image/jpeg' });
      formData.append('file', mockImageBlob, 'camera_frame.jpg');

      const response = await fetch('/api/frames/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        // Analysis will trigger events if risks detected
        console.log('Frame analysis initiated for', feedId);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBorder = (risk: string) => {
    switch (risk) {
      case 'critical': return 'border-red-500 border-4';
      case 'high': return 'border-orange-500 border-3';
      case 'medium': return 'border-yellow-500 border-2';
      case 'low': return 'border-green-500 border-1';
      default: return 'border-gray-300 border-1';
    }
  };

  return (
    <Card className="spiritual-border shadow-lg sacred-card divine-glow">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-card-foreground mb-6 flex items-center space-x-3 font-vintage text-shadow-golden floating-om">
          <i className="fas fa-video text-primary divine-glow"></i>
          <span>Divine Vision Feeds • दिव्य दृश्य</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {mockFeeds.map((feed) => (
            <div
              key={feed.id}
              className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${getRiskBorder(feed.riskLevel)} ${selectedFeed === feed.id ? 'ring-4 ring-primary' : ''}`}
              onClick={() => setSelectedFeed(selectedFeed === feed.id ? null : feed.id)}
              data-testid={`camera-feed-${feed.id}`}
            >
              {/* Camera Feed Display */}
              <div className="aspect-video bg-black relative">
                {feed.status === 'maintenance' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <i className="fas fa-tools text-2xl mb-2"></i>
                      <p className="text-sm">Under Maintenance</p>
                    </div>
                  </div>
                ) : feed.thumbnail ? (
                  <img
                    src={feed.thumbnail}
                    alt={feed.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <i className="fas fa-camera text-2xl mb-2"></i>
                      <p className="text-sm">Camera Feed</p>
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${feed.status === 'online' ? 'bg-green-500' : feed.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'} ${feed.status === 'online' ? 'pulse-ring' : ''}`}></div>

                {/* Crowd Density Badge */}
                {feed.status === 'online' && (
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded ${getDensityColor(feed.crowdDensity)}`}>
                    {feed.crowdDensity.toUpperCase()}
                  </div>
                )}

                {/* People Count */}
                {feed.status === 'online' && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                    👥 {feed.peopleCount.toLocaleString()}
                  </div>
                )}

                {/* Live Indicator */}
                {feed.status === 'online' && (
                  <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="p-3 bg-card">
                <h4 className="font-semibold text-card-foreground text-sm truncate">{feed.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{feed.zone}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(feed.lastUpdate).toLocaleTimeString('en-IN')}
                  </span>
                  {feed.status === 'online' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeFeed(feed.id);
                      }}
                      disabled={isAnalyzing}
                      data-testid={`analyze-button-${feed.id}`}
                    >
                      {isAnalyzing ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-brain"></i>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Info Panel */}
              {selectedFeed === feed.id && feed.status === 'online' && (
                <div className="absolute inset-0 bg-black bg-opacity-90 text-white p-4 flex flex-col justify-center">
                  <div className="text-center">
                    <h3 className="font-bold mb-2">{feed.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>Zone: {feed.zone}</p>
                      <p>Density: <span className={`font-bold ${feed.crowdDensity === 'critical' ? 'text-red-400' : feed.crowdDensity === 'high' ? 'text-orange-400' : feed.crowdDensity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{feed.crowdDensity.toUpperCase()}</span></p>
                      <p>People Count: {feed.peopleCount.toLocaleString()}</p>
                      <p>Risk Level: <span className={`font-bold ${feed.riskLevel === 'critical' ? 'text-red-400' : feed.riskLevel === 'high' ? 'text-orange-400' : feed.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{feed.riskLevel.toUpperCase()}</span></p>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 bg-primary text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeFeed(feed.id);
                      }}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-brain mr-2"></i>
                          AI Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Control Panel */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-ring"></div>
                <span>{mockFeeds.filter(f => f.status === 'online').length} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>{mockFeeds.filter(f => f.status === 'maintenance').length} Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Total: {mockFeeds.reduce((sum, f) => sum + f.peopleCount, 0).toLocaleString()} Devotees</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.reload()}
              data-testid="refresh-feeds-button"
            >
              <i className="fas fa-refresh mr-2"></i>
              Refresh All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}