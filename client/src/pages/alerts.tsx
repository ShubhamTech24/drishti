import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AlertsPage() {
  const { toast } = useToast();
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    zones: [] as string[],
    language: 'multi'
  });

  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000,
  });

  const broadcastMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to broadcast alert');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert Broadcasted",
        description: "Alert has been successfully sent to all selected zones.",
      });
      setAlertForm({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        zones: [],
        language: 'multi'
      });
    },
  });

  // Mock data for demonstration
  const mockAlerts = [
    {
      id: 'alert001',
      title: 'Crowd Density Alert • भीड़ चेतावनी',
      message: 'High crowd density at Ram Ghat. Please use alternate routes. राम घाट पर अधिक भीड़। कृपया वैकल्पिक मार्ग का उपयोग करें।',
      type: 'warning',
      priority: 'high',
      zones: ['Ram Ghat Zone-A', 'Ram Ghat Zone-B'],
      status: 'active',
      broadcastAt: '25 minutes ago',
      language: 'multi',
      recipients: 2500
    },
    {
      id: 'alert002',
      title: 'Medical Emergency • चिकित्सा आपातकाल',
      message: 'Medical team dispatched to Mahakal Temple. Please maintain clear pathways. महाकाल मंदिर में मेडिकल टीम भेजी गई। कृपया रास्ता साफ रखें।',
      type: 'emergency',
      priority: 'critical',
      zones: ['Mahakal Temple'],
      status: 'active',
      broadcastAt: '12 minutes ago',
      language: 'multi',
      recipients: 800
    },
    {
      id: 'alert003',
      title: 'Weather Update • मौसम अपडेट',
      message: 'Light rain expected in 30 minutes. Please seek shelter if needed. 30 मिनट में हल्की बारिश की संभावना। आवश्यकता हो तो आश्रय लें।',
      type: 'info',
      priority: 'low',
      zones: ['All Zones'],
      status: 'expired',
      broadcastAt: '2 hours ago',
      language: 'multi',
      recipients: 15000
    },
    {
      id: 'alert004',
      title: 'Traffic Diversion • यातायात मोड़',
      message: 'Parking Zone-C temporarily closed. Use Parking Zone-A or B. पार्किंग जोन-C अस्थायी रूप से बंद। जोन-A या B का उपयोग करें।',
      type: 'general',
      priority: 'medium',
      zones: ['Parking Zone-C', 'Transit Hub-A', 'Transit Hub-B'],
      status: 'active',
      broadcastAt: '1 hour ago',
      language: 'multi',
      recipients: 1200
    }
  ];

  const displayAlerts = (alerts && alerts.length > 0) ? alerts : mockAlerts;

  const zones = [
    'All Zones',
    'Ram Ghat Zone-A',
    'Ram Ghat Zone-B',
    'Mahakal Temple',
    'Shipra Ghat',
    'Transit Hub-A',
    'Transit Hub-B',
    'Parking Zone-A',
    'Parking Zone-B',
    'Parking Zone-C',
    'Food Court',
    'Medical Center'
  ];

  const handleZoneToggle = (zone: string) => {
    setAlertForm(prev => ({
      ...prev,
      zones: prev.zones.includes(zone) 
        ? prev.zones.filter(z => z !== zone)
        : [...prev.zones, zone]
    }));
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertForm.zones.length === 0) {
      toast({
        title: "No Zones Selected",
        description: "Please select at least one zone for broadcast.",
        variant: "destructive",
      });
      return;
    }
    broadcastMutation.mutate(alertForm);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-600';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      case 'general': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background lotus-pattern">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg spiritual-border temple-texture">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <i className="fas fa-eye text-2xl text-accent-foreground"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-vintage text-shadow-golden">दृष्टि Drishti</h1>
                  <p className="text-sm opacity-90 font-devanagari">Alert Broadcast • चेतावनी प्रसारण</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-ring"></div>
                  <span>Active: {displayAlerts.filter((a: any) => a.status === 'active').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical: {displayAlerts.filter((a: any) => a.priority === 'critical').length}</span>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <Tabs defaultValue="broadcast" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="broadcast" data-testid="tab-broadcast">
              <i className="fas fa-bullhorn mr-2"></i>
              New Broadcast • नया प्रसारण
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <i className="fas fa-history mr-2"></i>
              Alert History • चेतावनी इतिहास
            </TabsTrigger>
          </TabsList>

          {/* New Broadcast Tab */}
          <TabsContent value="broadcast" className="space-y-6">
            <Card className="spiritual-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <i className="fas fa-broadcast-tower text-primary"></i>
                  <span>Create Alert Broadcast • अलर्ट प्रसारण बनाएं</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBroadcast} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Alert Title • शीर्षक</label>
                      <Input
                        value={alertForm.title}
                        onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
                        placeholder="Enter alert title"
                        required
                        data-testid="input-alert-title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Alert Type • प्रकार</label>
                      <Select value={alertForm.type} onValueChange={(value) => setAlertForm({...alertForm, type: value})}>
                        <SelectTrigger data-testid="select-alert-type">
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency • आपातकाल</SelectItem>
                          <SelectItem value="warning">Warning • चेतावनी</SelectItem>
                          <SelectItem value="info">Information • जानकारी</SelectItem>
                          <SelectItem value="general">General • सामान्य</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority • प्राथमिकता</label>
                      <Select value={alertForm.priority} onValueChange={(value) => setAlertForm({...alertForm, priority: value})}>
                        <SelectTrigger data-testid="select-alert-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical • गंभीर</SelectItem>
                          <SelectItem value="high">High • उच्च</SelectItem>
                          <SelectItem value="medium">Medium • मध्यम</SelectItem>
                          <SelectItem value="low">Low • निम्न</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Language • भाषा</label>
                      <Select value={alertForm.language} onValueChange={(value) => setAlertForm({...alertForm, language: value})}>
                        <SelectTrigger data-testid="select-alert-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multi">Multi-language • बहुभाषी</SelectItem>
                          <SelectItem value="hindi">Hindi • हिंदी</SelectItem>
                          <SelectItem value="english">English • अंग्रेजी</SelectItem>
                          <SelectItem value="marathi">Marathi • मराठी</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alert Message • संदेश</label>
                    <Textarea
                      value={alertForm.message}
                      onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
                      placeholder="Enter detailed alert message (will be automatically translated if multi-language is selected)"
                      required
                      rows={4}
                      data-testid="textarea-alert-message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Target Zones • लक्षित क्षेत्र</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {zones.map(zone => (
                        <div
                          key={zone}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            alertForm.zones.includes(zone) 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                          onClick={() => handleZoneToggle(zone)}
                          data-testid={`zone-${zone.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        >
                          <div className="text-sm font-medium">{zone}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected zones: {alertForm.zones.length} • चयनित क्षेत्र: {alertForm.zones.length}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={broadcastMutation.isPending}
                    data-testid="button-broadcast-alert"
                  >
                    {broadcastMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Broadcasting Alert...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-bullhorn mr-2"></i>
                        Broadcast Alert to Selected Zones
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                displayAlerts.map((alert: any) => (
                  <Card key={alert.id} className="spiritual-border shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 ${getTypeColor(alert.type)} rounded-full flex items-center justify-center text-white`}>
                            <i className="fas fa-bullhorn text-lg"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground">Broadcast {alert.broadcastAt}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-card-foreground">{alert.message}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {alert.zones.map((zone: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {zone}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm border-t pt-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-users text-primary"></i>
                              <span>{alert.recipients.toLocaleString()} recipients</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-globe text-primary"></i>
                              <span>{alert.language === 'multi' ? 'Multi-language' : alert.language}</span>
                            </div>
                          </div>
                          {alert.status === 'active' && (
                            <Button size="sm" variant="outline" className="text-red-600">
                              <i className="fas fa-stop mr-2"></i>
                              Cancel Alert
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}