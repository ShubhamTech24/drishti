import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SimulatedCamera {
  id: string;
  name: string;
  zone: string;
  status: 'live' | 'demo' | 'offline';
  density: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  videoSource?: string;
  isSimulated: boolean;
  demoType: 'crowd' | 'lost_person' | 'emergency';
}

export default function SimulatedCameraGrid() {
  const [cameras, setCameras] = useState<SimulatedCamera[]>([
    {
      id: 'CAM-LIVE-01',
      name: 'Ram Ghat Main - LIVE',
      zone: 'Ram Ghat Zone-A',
      status: 'live',
      density: 'critical',
      count: 2847,
      isSimulated: false,
      demoType: 'crowd',
      videoSource: '/attached_assets/generated_images/Dense_Mahakumbh_crowd_scene_25e9b4b2.png'
    },
    {
      id: 'CAM-DEMO-01',
      name: 'Demo Feed - Crowd Analysis',
      zone: 'Demo Zone-A',
      status: 'demo',
      density: 'high',
      count: 1523,
      isSimulated: true,
      demoType: 'crowd',
      videoSource: '/attached_assets/generated_images/Temple_crowd_safety_background_c71524c3.png'
    },
    {
      id: 'CAM-DEMO-02',
      name: 'Demo Feed - Lost Person',
      zone: 'Demo Zone-B',
      status: 'demo',
      density: 'medium',
      count: 892,
      isSimulated: true,
      demoType: 'lost_person',
      videoSource: '/attached_assets/generated_images/Lost_person_identification_portrait_47308cff.png'
    },
    {
      id: 'CAM-DEMO-03',
      name: 'Demo Feed - Emergency',
      zone: 'Demo Zone-C',
      status: 'demo',
      density: 'low',
      count: 234,
      isSimulated: true,
      demoType: 'emergency',
      videoSource: '/attached_assets/generated_images/Sacred_emergency_alert_mandala_28ae0dbf.png'
    }
  ]);

  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate live data updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map(camera => {
        if (camera.isSimulated && camera.status === 'demo') {
          // Simulate realistic crowd changes
          const change = Math.floor(Math.random() * 20) - 10;
          const newCount = Math.max(0, camera.count + change);
          
          let newDensity = camera.density;
          if (newCount > 2000) newDensity = 'critical';
          else if (newCount > 1200) newDensity = 'high';
          else if (newCount > 600) newDensity = 'medium';
          else newDensity = 'low';

          return { ...camera, count: newCount, density: newDensity };
        }
        return camera;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDemoAnalysis = async (camera: SimulatedCamera) => {
    setIsAnalyzing(camera.id);
    
    try {
      // Simulate AI analysis based on demo type
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoResults = {
        crowd: {
          analysis: 'High crowd density detected',
          peopleCount: camera.count,
          riskLevel: camera.density,
          recommendations: ['Deploy additional volunteers', 'Monitor bottleneck points'],
          aiConfidence: 0.92
        },
        lost_person: {
          analysis: 'Face recognition analysis complete',
          facesDetected: 8,
          matchesFound: 1,
          matchConfidence: 0.87,
          matchDetails: 'Potential match found for missing person case LP-2025-001'
        },
        emergency: {
          analysis: 'Emergency pattern recognition',
          alertsDetected: ['Medical assistance needed', 'Crowd disturbance'],
          priority: 'high',
          responseTime: '2.3 minutes'
        }
      };

      const result = demoResults[camera.demoType];
      
      toast({
        title: `AI Analysis Complete - ${camera.name}`,
        description: JSON.stringify(result, null, 2),
      });

      // Simulate creating an event for demonstration
      setTimeout(() => {
        toast({
          title: "Event Created",
          description: `New ${camera.demoType} event created from ${camera.name} analysis`,
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete AI analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'demo': return 'bg-blue-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="spiritual-border shadow-lg sacred-card divine-glow">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-card-foreground mb-6 flex items-center space-x-3 font-vintage text-shadow-golden">
          <i className="fas fa-video text-primary divine-glow"></i>
          <span>Prototype Camera Feeds • प्रोटोटाइप कैमरा फीड</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${selectedCamera === camera.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'} ${camera.density === 'critical' ? 'border-red-500' : ''}`}
              onClick={() => setSelectedCamera(selectedCamera === camera.id ? null : camera.id)}
              data-testid={`simulated-camera-${camera.id}`}
            >
              {/* Camera Feed Display */}
              <div className="aspect-video bg-black relative">
                {camera.videoSource ? (
                  <img
                    src={camera.videoSource}
                    alt={camera.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <i className="fas fa-camera text-3xl mb-2"></i>
                      <p className="text-sm">Demo Camera Feed</p>
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(camera.status)} ${camera.status === 'live' || camera.status === 'demo' ? 'pulse-ring' : ''}`}></div>

                {/* Demo Badge */}
                {camera.isSimulated && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded font-bold">
                    DEMO
                  </div>
                )}

                {/* Density Badge */}
                <div className={`absolute top-12 left-2 px-2 py-1 text-xs font-bold rounded ${getDensityColor(camera.density)}`}>
                  {camera.density.toUpperCase()}
                </div>

                {/* People Count */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                  👥 {camera.count.toLocaleString()}
                </div>

                {/* Live/Demo Indicator */}
                <div className={`absolute bottom-2 right-2 ${camera.status === 'live' ? 'bg-red-600' : 'bg-blue-600'} text-white px-2 py-1 text-xs rounded flex items-center space-x-1`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>{camera.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Camera Info */}
              <div className="p-3 bg-card">
                <h4 className="font-semibold text-card-foreground text-sm truncate">{camera.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{camera.zone}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {camera.demoType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoAnalysis(camera);
                    }}
                    disabled={isAnalyzing === camera.id}
                    data-testid={`button-demo-analyze-${camera.id}`}
                  >
                    {isAnalyzing === camera.id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-brain"></i>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Demo Panel */}
              {selectedCamera === camera.id && (
                <div className="absolute inset-0 bg-black bg-opacity-95 text-white p-4 flex flex-col justify-center">
                  <div className="text-center">
                    <h3 className="font-bold mb-2">{camera.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>Zone: {camera.zone}</p>
                      <p>Type: <span className="text-blue-400 font-bold">{camera.demoType.replace('_', ' ').toUpperCase()}</span></p>
                      <p>Status: <span className={`font-bold ${camera.status === 'live' ? 'text-green-400' : 'text-blue-400'}`}>{camera.status.toUpperCase()}</span></p>
                      <p>Density: <span className={`font-bold ${camera.density === 'critical' ? 'text-red-400' : camera.density === 'high' ? 'text-orange-400' : camera.density === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{camera.density.toUpperCase()}</span></p>
                      <p>People Count: {camera.count.toLocaleString()}</p>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 bg-primary text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoAnalysis(camera);
                      }}
                      disabled={isAnalyzing === camera.id}
                    >
                      {isAnalyzing === camera.id ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-brain mr-2"></i>
                          Run Demo Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo Control Panel */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-ring"></div>
                <span>{cameras.filter(c => c.status === 'live').length} Live</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full pulse-ring"></div>
                <span>{cameras.filter(c => c.status === 'demo').length} Demo Feeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Total: {cameras.reduce((sum, c) => sum + c.count, 0).toLocaleString()} People</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge variant="secondary" className="text-xs">
                Prototype Mode Active
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-demo"
              >
                <i className="fas fa-refresh mr-1"></i>
                Reset Demo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}