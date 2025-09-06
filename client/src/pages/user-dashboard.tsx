import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, HelpCircle, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  createdAt: string;
}

export default function UserDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [helpForm, setHelpForm] = useState({
    userName: "",
    userContact: "",
    location: "",
    description: "",
    requestType: "general"
  });

  // Fetch active notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000, // Check for new notifications every 5 seconds
  });

  // Fetch user's help requests
  const { data: userHelpRequests, isLoading: helpRequestsLoading } = useQuery({
    queryKey: ['/api/help-requests'],
    refetchInterval: 3000, // Check for updates every 3 seconds
  });

  // Submit help request
  const helpRequestMutation = useMutation({
    mutationFn: async (data: typeof helpForm) => {
      const response = await fetch('/api/help-requests', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to submit help request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Help Request Submitted",
        description: "Your request has been sent to the admin team. Help is on the way!",
      });
      setHelpForm({
        userName: "",
        userContact: "",
        location: "",
        description: "",
        requestType: "general"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/help-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit help request. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Acknowledge notification
  const acknowledgeNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to acknowledge notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Acknowledged",
        description: "Thank you for acknowledging this notification.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'assigned': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disaster': return '🌪️';
      case 'panic': return '🚨';
      case 'emergency': return '🆘';
      default: return '📢';
    }
  };

  const handleSubmitHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpForm.userName || !helpForm.userContact || !helpForm.location || !helpForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    helpRequestMutation.mutate(helpForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🕉️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Drishti - User Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mahakumbh 2028 Pilgrim Services
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard">
                <Button variant="outline" data-testid="link-admin">Admin View</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="link-main">Main Dashboard</Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Active Notifications */}
          <Card data-testid="card-notifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Active Alerts & Notifications
              </CardTitle>
              <CardDescription>
                Important updates from festival organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="text-center py-4">Loading notifications...</div>
              ) : (notifications as Notification[])?.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(notifications as Notification[]).map((notification: Notification) => (
                    <Alert key={notification.id} data-testid={`notification-${notification.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="text-xl">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <Badge variant={getSeverityColor(notification.severity)}>
                              {notification.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            {notification.message}
                          </AlertDescription>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => acknowledgeNotification.mutate(notification.id)}
                              disabled={acknowledgeNotification.isPending}
                              data-testid={`acknowledge-${notification.id}`}
                            >
                              {acknowledgeNotification.isPending ? 'Acknowledging...' : 'Acknowledge'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active notifications</p>
                  <p className="text-sm">All clear! Enjoy the festival safely.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Request Status */}
          <Card data-testid="card-help-status">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Your Help Requests
              </CardTitle>
              <CardDescription>
                Track the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {helpRequestsLoading ? (
                <div className="text-center py-4">Loading your requests...</div>
              ) : (userHelpRequests as any[])?.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {(userHelpRequests as any[]).slice(0, 3).map((request: any) => (
                    <div key={request.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{request.requestType}</span>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {request.description.length > 50 ? 
                          `${request.description.substring(0, 50)}...` : 
                          request.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No help requests submitted</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Request Form */}
          <Card data-testid="card-help-request">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Request Help
              </CardTitle>
              <CardDescription>
                Need assistance? Submit a help request to our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitHelp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Your Name *</Label>
                    <Input
                      id="userName"
                      data-testid="input-user-name"
                      value={helpForm.userName}
                      onChange={(e) => setHelpForm({...helpForm, userName: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userContact">Contact Number *</Label>
                    <Input
                      id="userContact"
                      data-testid="input-user-contact"
                      value={helpForm.userContact}
                      onChange={(e) => setHelpForm({...helpForm, userContact: e.target.value})}
                      placeholder="Phone number or email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Your Location *</Label>
                  <Input
                    id="location"
                    data-testid="input-location"
                    value={helpForm.location}
                    onChange={(e) => setHelpForm({...helpForm, location: e.target.value})}
                    placeholder="Ram Ghat, Mahakal Temple, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="requestType">Type of Help</Label>
                  <Select value={helpForm.requestType} onValueChange={(value) => setHelpForm({...helpForm, requestType: value})}>
                    <SelectTrigger data-testid="select-request-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="security">Security Issue</SelectItem>
                      <SelectItem value="lost_person">Lost Person</SelectItem>
                      <SelectItem value="general">General Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    data-testid="textarea-description"
                    value={helpForm.description}
                    onChange={(e) => setHelpForm({...helpForm, description: e.target.value})}
                    placeholder="Describe what kind of help you need..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={helpRequestMutation.isPending}
                  data-testid="button-submit-help"
                >
                  {helpRequestMutation.isPending ? 'Submitting...' : 'Submit Help Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card data-testid="card-emergency-contacts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-800 dark:text-red-200">Emergency Services</div>
                    <div className="text-sm text-red-600 dark:text-red-300">Medical, Fire, Police</div>
                  </div>
                  <Button variant="destructive" size="sm" data-testid="button-call-emergency">
                    📞 100 / 108
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-orange-800 dark:text-orange-200">Festival Control Room</div>
                    <div className="text-sm text-orange-600 dark:text-orange-300">24/7 Mahakumbh Support</div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-call-control">
                    📞 +91-7000-000-000
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-blue-800 dark:text-blue-200">Lost & Found</div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">Missing persons helpline</div>
                  </div>
                  <Link href="/lost-and-found">
                    <Button variant="outline" size="sm" data-testid="link-lost-found">
                      🔍 Search
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card data-testid="card-quick-links">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/divine-vision">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1" data-testid="link-divine-vision">
                    <span className="text-lg">👁️</span>
                    <span className="text-xs">Crowd Monitor</span>
                  </Button>
                </Link>
                
                <Link href="/lost-and-found">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1" data-testid="link-lost-found-quick">
                    <span className="text-lg">🔍</span>
                    <span className="text-xs">Lost & Found</span>
                  </Button>
                </Link>
                
                <Link href="/alerts">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1" data-testid="link-alerts">
                    <span className="text-lg">🚨</span>
                    <span className="text-xs">Safety Alerts</span>
                  </Button>
                </Link>
                
                <Link href="/volunteers">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1" data-testid="link-volunteers">
                    <span className="text-lg">👥</span>
                    <span className="text-xs">Volunteers</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}