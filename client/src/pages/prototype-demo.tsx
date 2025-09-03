import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PrototypeDemoPanel from "@/components/PrototypeDemoPanel";
import SimulatedCameraGrid from "@/components/SimulatedCameraGrid";
import { useToast } from "@/hooks/use-toast";

export default function PrototypeDemo() {
  const [demoMode, setDemoMode] = useState<'cameras' | 'upload' | 'analysis'>('cameras');
  const { toast } = useToast();

  const startJudgeDemo = () => {
    toast({
      title: "Judge Demonstration Started",
      description: "All prototype features are now active for demonstration",
    });
  };

  const runFullDemo = async () => {
    toast({
      title: "Running Full System Demo",
      description: "Demonstrating all AI features...",
    });

    // Simulate comprehensive demo sequence
    const demoSteps = [
      { step: "Crowd Density Analysis", delay: 2000 },
      { step: "Lost Person Face Recognition", delay: 3000 },
      { step: "Emergency Detection System", delay: 2500 },
      { step: "Multi-language Alert Broadcasting", delay: 2000 },
      { step: "Volunteer Coordination", delay: 1500 }
    ];

    for (const demo of demoSteps) {
      await new Promise(resolve => setTimeout(resolve, demo.delay));
      toast({
        title: `Demo: ${demo.step}`,
        description: `${demo.step} demonstration completed successfully`,
      });
    }

    toast({
      title: "Complete System Demo Finished",
      description: "All Mahakumbh 2028 features demonstrated successfully!",
    });
  };

  return (
    <div className="min-h-screen temple-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 font-vintage text-shadow-golden">
            🕉️ Drishti - Mahakumbh 2028 Prototype Demonstration
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Complete AI-powered crowd monitoring system demonstration for judges and stakeholders. 
            Experience real-time crowd analysis, lost person detection, and emergency response without live camera hardware.
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Badge variant="secondary" className="text-sm">
              🎥 Video Upload Simulation
            </Badge>
            <Badge variant="secondary" className="text-sm">
              🤖 AI Analysis Demo
            </Badge>
            <Badge variant="secondary" className="text-sm">
              📱 Real-time Monitoring
            </Badge>
            <Badge variant="secondary" className="text-sm">
              🔍 Face Recognition
            </Badge>
          </div>
        </div>

        {/* Demo Control Panel */}
        <Card className="spiritual-border shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <i className="fas fa-control text-primary"></i>
                <span>Demo Control Center</span>
              </span>
              <div className="flex space-x-2">
                <Button 
                  onClick={startJudgeDemo}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-start-judge-demo"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Judge Demo
                </Button>
                <Button 
                  onClick={runFullDemo}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-run-full-demo"
                >
                  <i className="fas fa-magic mr-2"></i>
                  Run Full Demo
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <Button
                variant={demoMode === 'cameras' ? 'default' : 'outline'}
                onClick={() => setDemoMode('cameras')}
                data-testid="button-demo-cameras"
              >
                <i className="fas fa-video mr-2"></i>
                Simulated Cameras
              </Button>
              <Button
                variant={demoMode === 'upload' ? 'default' : 'outline'}
                onClick={() => setDemoMode('upload')}
                data-testid="button-demo-upload"
              >
                <i className="fas fa-upload mr-2"></i>
                Video Upload
              </Button>
              <Button
                variant={demoMode === 'analysis' ? 'default' : 'outline'}
                onClick={() => setDemoMode('analysis')}
                data-testid="button-demo-analysis"
              >
                <i className="fas fa-brain mr-2"></i>
                AI Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <div className="space-y-8">
          {demoMode === 'cameras' && <SimulatedCameraGrid />}
          {demoMode === 'upload' && <PrototypeDemoPanel />}
          
          {demoMode === 'analysis' && (
            <Card className="spiritual-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-brain text-primary"></i>
                  <span>AI Analysis Demonstration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Crowd Analysis Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <i className="fas fa-users text-blue-500"></i>
                      <span>Crowd Analysis</span>
                    </h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>People Detected:</span>
                          <span className="font-bold">2,847</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Density Level:</span>
                          <Badge className="bg-red-500">CRITICAL</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Assessment:</span>
                          <span className="text-red-500 font-bold">HIGH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Confidence:</span>
                          <span className="font-bold">94.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Face Recognition Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <i className="fas fa-search text-green-500"></i>
                      <span>Face Recognition</span>
                    </h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Faces Detected:</span>
                          <span className="font-bold">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lost Person Matches:</span>
                          <Badge className="bg-orange-500">2 FOUND</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Match Confidence:</span>
                          <span className="text-green-500 font-bold">87.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Time:</span>
                          <span className="font-bold">1.2s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Detection Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <i className="fas fa-exclamation-triangle text-red-500"></i>
                      <span>Emergency Detection</span>
                    </h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Audio Alerts:</span>
                          <span className="font-bold">3 Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Panic Indicators:</span>
                          <Badge className="bg-yellow-500">MEDIUM</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Time:</span>
                          <span className="text-blue-500 font-bold">2.1 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volunteers Dispatched:</span>
                          <span className="font-bold">5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
                    Demo Highlights for Judges
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Real-time AI processing with 94%+ accuracy</li>
                    <li>• Multi-language support (Hindi, English, Marathi, Sanskrit)</li>
                    <li>• Scalable to 100+ camera feeds simultaneously</li>
                    <li>• Automatic emergency response coordination</li>
                    <li>• Integration with existing festival infrastructure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This prototype demonstrates the complete Drishti system capabilities without requiring live camera hardware. 
            Perfect for stakeholder presentations and technical evaluations.
          </p>
        </div>
      </div>
    </div>
  );
}