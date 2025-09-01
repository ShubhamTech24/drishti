import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@shared/schema";

export default function RecentReports() {
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'panic': return 'fas fa-exclamation-triangle';
      case 'congestion': return 'fas fa-users';
      case 'medical': return 'fas fa-heartbeat';
      case 'lost_person': return 'fas fa-child';
      case 'hazard': return 'fas fa-warning';
      default: return 'fas fa-info-circle';
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'panic': return 'destructive';
      case 'medical': return 'primary';
      case 'lost_person': return 'primary';
      case 'congestion': return 'accent';
      case 'hazard': return 'destructive';
      default: return 'muted';
    }
  };

  // Mock reports data for display
  const mockReports = [
    {
      id: 'r001',
      type: 'panic',
      text: 'Panic button activated from Ram Ghat area',
      createdAt: new Date(Date.now() - 3 * 60 * 1000),
      lat: 23.1765,
      lng: 75.7885,
      status: 'new'
    },
    {
      id: 'r002',
      type: 'congestion',
      text: 'भीड़ बहुत ज्यादा है यहाँ (Crowd too heavy here)',
      createdAt: new Date(Date.now() - 8 * 60 * 1000),
      lat: 23.1825,
      lng: 75.7685,
      status: 'triaged'
    },
    {
      id: 'r003',
      type: 'lost_person',
      text: 'Child missing near Triveni Sangam',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      lat: 23.1705,
      lng: 75.7785,
      status: 'assigned'
    },
    {
      id: 'r004',
      type: 'medical',
      text: 'Medical assistance completed',
      createdAt: new Date(Date.now() - 22 * 60 * 1000),
      lat: 23.1695,
      lng: 75.7685,
      status: 'resolved'
    }
  ];

  const displayReports = (reports && reports.length > 0) ? reports : mockReports;

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center space-x-2">
          <i className="fas fa-file-alt text-primary"></i>
          <span>Recent Reports • रिपोर्ट</span>
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="reports-list">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 pulse-ring"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : !displayReports || displayReports.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-clipboard-list text-4xl text-muted-foreground mb-2"></i>
              <p className="text-muted-foreground">No reports available</p>
            </div>
          ) : (
            displayReports.map((report: any) => (
              <div 
                key={report.id}
                className={`p-3 bg-${getReportColor(report.type)}/5 border-l-4 border-${getReportColor(report.type)} rounded-lg`}
                data-testid={`report-card-${report.id}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <i className={`${getReportIcon(report.type)} text-${getReportColor(report.type)}`}></i>
                  <span className={`text-sm font-semibold text-${getReportColor(report.type)}`}>
                    {report.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(report.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-card-foreground mb-1">
                  {report.text || 'No description available'}
                </p>
                {report.lat && report.lng && (
                  <p className="text-xs text-muted-foreground">
                    Location: {report.lat}, {report.lng}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        
        <Button 
          className="w-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          data-testid="button-view-all-reports"
        >
          <i className="fas fa-list mr-2"></i>
          View All Reports
        </Button>
      </CardContent>
    </Card>
  );
}
