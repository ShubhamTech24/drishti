import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  const { toast } = useToast();
  const { socket, isConnected } = useWebSocket();

  const currentDateTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen flex flex-col bg-background lotus-pattern mandala-bg">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg spiritual-border temple-texture vintage-glow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <i className="fas fa-eye text-2xl text-accent-foreground"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-vintage text-shadow-golden">दृष्टि Drishti</h1>
                <p className="text-sm opacity-90 font-devanagari">महाकुंभ 2028 • उज्जैन कमांड सेंटर • Ujjain Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-4">
                <a href="/" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Dashboard
                </a>
                <a href="/divine-vision" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Divine Vision
                </a>
                <a href="/lost-and-found" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Lost & Found
                </a>
                <a href="/volunteers" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Volunteers
                </a>
                <a href="/incidents" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Incidents
                </a>
                <a href="/alerts" className="text-sm px-3 py-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors">
                  Alerts
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success pulse-ring' : 'bg-destructive'}`}></div>
                  <span className="text-sm">AI Systems {isConnected ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">247 Cameras Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm">15 Volunteers On Duty</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">{currentDateTime} IST</div>
                <div className="text-xs opacity-80">कुंभ मेला दिवस 8</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.location.href = '/admin-dashboard'}
                  variant="outline"
                  size="sm"
                  className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  data-testid="button-admin"
                >
                  <i className="fas fa-user-shield mr-2"></i>
                  Admin
                </Button>
                <Button 
                  onClick={() => window.location.href = '/user-dashboard'}
                  variant="outline"
                  size="sm"
                  className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  data-testid="button-user"
                >
                  <i className="fas fa-user mr-2"></i>
                  User
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Top Alert Banner */}
        <div className="bg-accent border-l-4 border-primary p-4 rounded-lg shadow-md vintage-card om-symbol">
          <div className="flex items-center space-x-3">
            <i className="fas fa-bell text-primary text-xl"></i>
            <div>
              <h3 className="font-semibold text-accent-foreground">System Status: सक्रिय Active</h3>
              <p className="text-sm text-accent-foreground opacity-80">All monitoring systems operational • Next system check in 15 minutes</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          {/* Left Panel: Live Map & Camera Feeds */}
          <div className="xl:col-span-2 space-y-6">
            <LiveCrowdMap />
            <EnhancedCameraFeed />
          </div>

          {/* Right Panel: Incidents & Controls */}
          <div className="space-y-6">
            <IncidentFeed />
            <QuickActionsEnhanced />
          </div>
        </div>

        {/* Bottom Panel: System Status & Management */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SystemHealth />
          <AlertBroadcast />
          <LostAndFound />
          <div className="space-y-6">
            <VolunteerManagement />
            <RecentReports />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground p-4 text-center">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <span>🕉️ सर्वे भवन्तु सुखिनः • May All Be Happy</span>
          <span>|</span>
          <span>Emergency Hotline: 108</span>
          <span>|</span>
          <span>Mahakumbh 2028 • Ujjain</span>
        </div>
      </footer>

      {/* Floating Emergency Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="bg-destructive text-destructive-foreground w-16 h-16 rounded-full shadow-2xl hover:scale-105 transition-transform"
          data-testid="button-emergency"
          onClick={() => {
            if (confirm('Activate Emergency Protocol? This will trigger immediate response procedures.')) {
              // Emergency protocol implementation
              toast({
                title: "Emergency Protocol Activated",
                description: "All response teams have been notified.",
                variant: "destructive",
              });
            }
          }}
        >
          <i className="fas fa-exclamation text-2xl"></i>
        </button>
      </div>
    </div>
  );
}
