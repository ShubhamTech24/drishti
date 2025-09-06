import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, AlertTriangle, Clock, MapPin, Shield } from "lucide-react";

export default function GuestDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch public data
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 5000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🙏 दृष्टि Drishti 🙏
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mahakumbh 2028 Command Center - Public Information
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentTime.toLocaleDateString('en-IN')}
                </div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {currentTime.toLocaleTimeString('en-IN')}
                </div>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/auth'}
                data-testid="button-login-header"
              >
                Login for Full Access
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Live Status Banner */}
        <div className="mb-8">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>🟢 System Status: OPERATIONAL</strong> - All monitoring systems active. Emergency services available 24/7.
            </AlertDescription>
          </Alert>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Live Monitoring</p>
                  <p className="text-2xl font-bold text-gray-900">47 Zones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Cameras</p>
                  <p className="text-2xl font-bold text-gray-900">234 Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Safety Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
            <TabsTrigger value="crowd">Crowd Analysis</TabsTrigger>
            <TabsTrigger value="safety">Safety Info</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Live Emergency Alerts
                </CardTitle>
                <CardDescription>
                  Real-time safety notifications and emergency updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification: any) => (
                      <Alert key={notification.id} className="border-l-4 border-l-orange-500">
                        <AlertDescription>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {notification.location || 'All Areas'}
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <Badge variant={notification.type === 'emergency' ? 'destructive' : 'secondary'}>
                              {notification.type}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-medium">All Clear</p>
                    <p>No active emergency alerts at this time</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="crowd" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  AI-Powered Crowd Analysis
                </CardTitle>
                <CardDescription>
                  Real-time crowd density monitoring across festival zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Ram Ghat</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Hanuman Ghat</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Main Entrance</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Parking Area A</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Food Court</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Medical Center</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>AI Insight:</strong> Peak crowd density expected between 6:00 AM - 8:00 AM during morning aarti. 
                    Alternative routes recommended via Gates 3 and 4.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="safety" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Safety Guidelines & Information
                </CardTitle>
                <CardDescription>
                  Essential safety information for all devotees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Emergency Hotline:</span>
                        <span className="font-bold text-red-600">108</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Command Center:</span>
                        <span className="font-bold">+91-112-DRISHTI</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Emergency:</span>
                        <span className="font-bold">102</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Safety Tips</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Stay hydrated and carry water</li>
                      <li>• Follow crowd direction signs</li>
                      <li>• Keep emergency contacts handy</li>
                      <li>• Report suspicious activities</li>
                      <li>• Use designated pathways only</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">🚨 Important Notice</h4>
                  <p className="text-orange-700 text-sm">
                    All areas are under 24/7 AI surveillance for your safety. In case of any emergency, 
                    raise your hand and our AI system will detect and dispatch immediate help.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Available Services
                </CardTitle>
                <CardDescription>
                  Complete list of facilities and services at Mahakumbh 2028
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">🏥 Medical Services</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Main Medical Center</li>
                      <li>• 12 First Aid Posts</li>
                      <li>• Mobile Ambulances</li>
                      <li>• Emergency Helicopter</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">🍽️ Food & Water</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Central Food Court</li>
                      <li>• Free Drinking Water</li>
                      <li>• Prasad Distribution</li>
                      <li>• Satvik Food Stalls</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">🅿️ Other Facilities</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Parking Areas (A-F)</li>
                      <li>• Lost & Found Center</li>
                      <li>• Information Kiosks</li>
                      <li>• Public Restrooms</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-800 text-sm text-center">
                    <strong>Need Assistance?</strong> Register for an account to submit help requests, 
                    report lost items, and receive personalized safety alerts.
                  </p>
                  <div className="mt-3 text-center">
                    <Button 
                      onClick={() => window.location.href = '/auth'}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Account for Full Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}