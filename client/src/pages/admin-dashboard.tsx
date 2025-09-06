import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, HelpCircle, Send, Users, Calendar, Phone, Clock, CheckCircle, X } from "lucide-react";
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

interface HelpRequest {
  id: string;
  userName: string;
  userContact: string;
  location: string;
  description: string;
  requestType: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "general",
    severity: "medium"
  });

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000,
  });

  // Fetch help requests
  const { data: helpRequests, isLoading: helpRequestsLoading } = useQuery({
    queryKey: ['/api/help-requests'],
    refetchInterval: 3000,
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: typeof notificationForm) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to send notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Alert has been broadcast to all users.",
      });
      setNotificationForm({
        title: "",
        message: "",
        type: "general",
        severity: "medium"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update help request status mutation
  const updateHelpRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/help-requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Help request status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/help-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
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
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disaster': return '🌪️';
      case 'panic': return '🚨';
      case 'emergency': return '🆘';
      case 'medical': return '🏥';
      case 'security': return '🛡️';
      case 'lost_person': return '🔍';
      default: return '📢';
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message.",
        variant: "destructive",
      });
      return;
    }
    sendNotificationMutation.mutate(notificationForm);
  };

  const handleUpdateHelpRequest = (id: string, status: string) => {
    updateHelpRequestMutation.mutate({ id, status });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🛡️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Drishti - Admin Control Panel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mahakumbh 2028 Command Center
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/user-dashboard">
                <Button variant="outline" data-testid="link-user">User View</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" data-testid="link-main">Main Dashboard</Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => {
                  fetch('/api/logout', { method: 'POST' })
                    .then(() => window.location.href = '/')
                    .catch(() => window.location.href = '/');
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" data-testid="tab-notifications">Send Notifications</TabsTrigger>
            <TabsTrigger value="help-requests" data-testid="tab-help-requests">Help Requests</TabsTrigger>
          </TabsList>

          {/* Send Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Send Notification Form */}
              <Card data-testid="card-send-notification">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Broadcast Alert
                  </CardTitle>
                  <CardDescription>
                    Send emergency notifications to all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Alert Title *</Label>
                      <Input
                        id="title"
                        data-testid="input-notification-title"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                        placeholder="Emergency Alert Title"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Alert Type</Label>
                        <Select value={notificationForm.type} onValueChange={(value) => setNotificationForm({...notificationForm, type: value})}>
                          <SelectTrigger data-testid="select-notification-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disaster">🌪️ Natural Disaster</SelectItem>
                            <SelectItem value="panic">🚨 Panic/Stampede</SelectItem>
                            <SelectItem value="emergency">🆘 Emergency</SelectItem>
                            <SelectItem value="general">📢 General Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="severity">Severity Level</Label>
                        <Select value={notificationForm.severity} onValueChange={(value) => setNotificationForm({...notificationForm, severity: value})}>
                          <SelectTrigger data-testid="select-notification-severity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">🔴 Critical</SelectItem>
                            <SelectItem value="high">🟠 High</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="low">🟢 Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Alert Message *</Label>
                      <Textarea
                        id="message"
                        data-testid="textarea-notification-message"
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                        placeholder="Detailed alert message for users..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={sendNotificationMutation.isPending}
                      data-testid="button-send-notification"
                    >
                      {sendNotificationMutation.isPending ? 'Broadcasting...' : 'Broadcast Alert'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Active Notifications */}
              <Card data-testid="card-active-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Active Notifications
                  </CardTitle>
                  <CardDescription>
                    Currently broadcast alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notificationsLoading ? (
                    <div className="text-center py-4">Loading notifications...</div>
                  ) : (notifications as Notification[])?.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(notifications as Notification[]).slice(0, 5).map((notification: Notification) => (
                        <Alert key={notification.id} data-testid={`admin-notification-${notification.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="text-lg">
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
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.createdAt).toLocaleString()}
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
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Help Requests Tab */}
          <TabsContent value="help-requests" className="space-y-6">
            <Card data-testid="card-help-requests-admin">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Help Requests Management
                </CardTitle>
                <CardDescription>
                  Manage incoming help requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {helpRequestsLoading ? (
                  <div className="text-center py-4">Loading help requests...</div>
                ) : (helpRequests as HelpRequest[])?.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(helpRequests as HelpRequest[]).map((request: HelpRequest) => (
                      <Alert key={request.id} data-testid={`help-request-${request.id}`}>
                        <div className="flex items-start gap-3">
                          <div className="text-lg">
                            {getTypeIcon(request.requestType)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {request.userName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  📍 {request.location} • 📞 {request.userContact}
                                </p>
                              </div>
                              <Badge variant={getStatusColor(request.status)}>
                                {request.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <AlertDescription className="text-sm mb-3">
                              <strong>Type:</strong> {request.requestType.replace('_', ' ')} <br />
                              <strong>Description:</strong> {request.description}
                            </AlertDescription>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {new Date(request.createdAt).toLocaleString()}
                              </div>
                              <div className="flex gap-2">
                                {request.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleUpdateHelpRequest(request.id, 'in_progress')}
                                    data-testid={`button-progress-${request.id}`}
                                  >
                                    📋 In Progress
                                  </Button>
                                )}
                                {request.status !== 'resolved' && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleUpdateHelpRequest(request.id, 'resolved')}
                                    data-testid={`button-resolve-${request.id}`}
                                  >
                                    ✅ Resolve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No help requests</p>
                    <p className="text-sm">All users are safe and secure.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}