import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LiveCrowdMap from "@/components/LiveCrowdMap";
import IncidentFeed from "@/components/IncidentFeed";
import EnhancedCameraFeed from "@/components/EnhancedCameraFeed";
import SystemHealth from "@/components/SystemHealth";
import QuickActionsEnhanced from "@/components/QuickActionsEnhanced";
import AlertBroadcast from "@/components/AlertBroadcast";
import LostAndFound from "@/components/LostAndFound";
import VolunteerManagement from "@/components/VolunteerManagement";
import RecentReports from "@/components/RecentReports";
import { useWebSocket } from "@/hooks/useWebSocket";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  active?: boolean;
}

export default function SophisticatedDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [activeSection, setActiveSection] = useState('overview');

  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview • सिंहावलोकन', icon: 'fas fa-tachometer-alt', active: activeSection === 'overview' },
    { id: 'crowd', label: 'Crowd Monitor • भीड़ निगरानी', icon: 'fas fa-users', badge: '3.2M', active: activeSection === 'crowd' },
    { id: 'cameras', label: 'Divine Vision • दिव्य दृष्टि', icon: 'fas fa-video', badge: '247', active: activeSection === 'cameras' },
    { id: 'incidents', label: 'Incidents • घटनाएं', icon: 'fas fa-exclamation-triangle', badge: '12', active: activeSection === 'incidents' },
    { id: 'alerts', label: 'Emergency • आपातकाल', icon: 'fas fa-siren', active: activeSection === 'alerts' },
    { id: 'volunteers', label: 'Volunteers • स्वयंसेवक', icon: 'fas fa-hands-helping', badge: '15', active: activeSection === 'volunteers' },
    { id: 'lost', label: 'Lost & Found • खोया-पाया', icon: 'fas fa-search', badge: '8', active: activeSection === 'lost' },
    { id: 'reports', label: 'Reports • रिपोर्ट', icon: 'fas fa-chart-bar', active: activeSection === 'reports' },
    { id: 'settings', label: 'Settings • सेटिंग्स', icon: 'fas fa-cog', active: activeSection === 'settings' },
  ];

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center temple-background">
        <div className="text-center glass-panel p-8 rounded-2xl">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 divine-glow">
            <i className="fas fa-eye text-3xl text-primary-foreground"></i>
          </div>
          <h2 className="text-2xl font-vintage text-card-foreground mb-2">दृष्टि Drishti</h2>
          <p className="text-muted-foreground">Initializing Sacred Command Center...</p>
        </div>
      </div>
    );
  }

  const currentDateTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="map-container-fixed">
                <LiveCrowdMap />
              </div>
              <div className="space-y-4">
                <SystemHealth />
                <QuickActionsEnhanced />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <IncidentFeed />
              <AlertBroadcast />
              <LostAndFound />
            </div>
          </div>
        );
      case 'crowd':
        return (
          <div className="space-y-6">
            <div className="map-container-fixed h-96">
              <LiveCrowdMap />
            </div>
            <SystemHealth />
          </div>
        );
      case 'cameras':
        return <EnhancedCameraFeed />;
      case 'incidents':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncidentFeed />
            <RecentReports />
          </div>
        );
      case 'alerts':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertBroadcast />
            <QuickActionsEnhanced />
          </div>
        );
      case 'volunteers':
        return <VolunteerManagement />;
      case 'lost':
        return <LostAndFound />;
      case 'reports':
        return <RecentReports />;
      case 'settings':
        return (
          <Card className="neo-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-vintage text-card-foreground mb-6">System Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span>Auto-refresh interval</span>
                  <span className="text-primary font-medium">10 seconds</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span>AI Analysis threshold</span>
                  <span className="text-primary font-medium">75%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span>Alert broadcast range</span>
                  <span className="text-primary font-medium">5 km radius</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-grid temple-background">
      {/* Sophisticated Sidebar */}
      <aside className="sidebar-glass panel-slide-in">
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-lg">
              <i className="fas fa-eye text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-vintage text-white font-bold">दृष्टि Drishti</h1>
              <p className="text-white text-opacity-80 text-sm font-devanagari">महाकुंभ 2028 उज्जैन</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="glass-panel p-4 rounded-xl mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-opacity-90 text-sm">AI Systems</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 pulse-ring' : 'bg-red-400'}`}></div>
                  <span className="text-white text-xs">{isConnected ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-opacity-90 text-sm">Active Cameras</span>
                <span className="text-white text-xs font-medium">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-opacity-90 text-sm">Current Time</span>
                <span className="text-white text-xs font-medium">{currentDateTime}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`nav-item w-full flex items-center space-x-3 p-3 text-left text-white ${
                  item.active ? 'active' : ''
                }`}
                data-testid={`nav-${item.id}`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                {item.badge && (
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="glass-panel p-4 rounded-xl mt-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-lg">
                <i className="fas fa-user text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{(user as any)?.email || 'Command Officer'}</p>
                <p className="text-white text-opacity-70 text-xs">Administrator</p>
              </div>
              <Button
                onClick={() => window.location.href = '/api/logout'}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-10"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        {/* Header */}
        <header className="glass-panel m-6 p-6 rounded-xl sticky top-6 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-vintage text-card-foreground capitalize">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-muted-foreground text-sm">
                Mahakumbh 2028 Command Center • Real-time monitoring active
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-ring"></div>
                  <span>3.2M Pilgrims</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>247 Cameras</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>15 Volunteers</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="divine-glow"
                onClick={() => {
                  if (confirm('Activate Emergency Protocol? This will trigger immediate response procedures.')) {
                    toast({
                      title: "Emergency Protocol Activated",
                      description: "All response teams have been notified.",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-emergency"
              >
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Emergency
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 pt-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}