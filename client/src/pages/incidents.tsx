import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Report } from "@shared/schema";
import { Link } from "wouter";

export default function IncidentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: incidents = [], isLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
    refetchInterval: 15000, // More frequent updates for incidents
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Status Updated",
        description: "Incident status has been updated successfully.",
      });
    },
  });

  // Mock data for demonstration
  const mockIncidents = [
    {
      id: 'inc001',
      incidentType: 'crowd_density',
      description: 'High crowd density detected at Ram Ghat Zone-A exceeding safe limits',
      location: 'Ram Ghat Zone-A',
      severity: 'high',
      status: 'investigating',
      reportedAt: '15 minutes ago',
      assignedTo: 'Security Team Alpha',
      riskLevel: 'HIGH',
      estimatedPeople: 2500
    },
    {
      id: 'inc002', 
      incidentType: 'medical_emergency',
      description: 'Elderly pilgrim collapsed near Mahakal Temple, medical assistance required',
      location: 'Mahakal Temple Entrance',
      severity: 'critical',
      status: 'responding',
      reportedAt: '8 minutes ago',
      assignedTo: 'Medical Team 2',
      riskLevel: 'CRITICAL',
      estimatedPeople: null
    },
    {
      id: 'inc003',
      incidentType: 'infrastructure',
      description: 'Temporary barricade damaged in Transit Hub-B, crowd flow disrupted',
      location: 'Transit Hub-B',
      severity: 'medium',
      status: 'resolved',
      reportedAt: '2 hours ago',
      assignedTo: 'Maintenance Crew',
      riskLevel: 'MEDIUM',
      estimatedPeople: 800
    },
    {
      id: 'inc004',
      incidentType: 'suspicious_activity',
      description: 'Unattended bag reported near Food Court area, security sweep requested',
      location: 'Food Court Area',
      severity: 'high',
      status: 'pending',
      reportedAt: '32 minutes ago',
      assignedTo: 'Security Team Beta',
      riskLevel: 'HIGH',
      estimatedPeople: null
    },
    {
      id: 'inc005',
      incidentType: 'traffic_congestion',
      description: 'Vehicle backup at Parking Zone-C causing pedestrian overflow',
      location: 'Parking Zone-C',
      severity: 'medium',
      status: 'investigating',
      reportedAt: '1 hour ago',
      assignedTo: 'Traffic Management',
      riskLevel: 'MEDIUM',
      estimatedPeople: 1200
    }
  ];

  const displayIncidents = incidents.length > 0 ? incidents : mockIncidents;
  
  const filteredIncidents = displayIncidents.filter((incident: any) => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSearch = incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.incidentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'investigating': return 'bg-blue-500';
      case 'responding': return 'bg-purple-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'fas fa-exclamation-triangle';
      case 'HIGH': return 'fas fa-exclamation-circle';
      case 'MEDIUM': return 'fas fa-info-circle';
      case 'LOW': return 'fas fa-check-circle';
      default: return 'fas fa-question-circle';
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case 'crowd_density': return 'fas fa-users';
      case 'medical_emergency': return 'fas fa-ambulance';
      case 'infrastructure': return 'fas fa-tools';
      case 'suspicious_activity': return 'fas fa-eye';
      case 'traffic_congestion': return 'fas fa-car';
      default: return 'fas fa-alert';
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
                  <p className="text-sm opacity-90 font-devanagari">Incident Management • घटना प्रबंधन</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full pulse-ring"></div>
                  <span>Critical: {filteredIncidents.filter((i: any) => i.severity === 'critical').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>High: {filteredIncidents.filter((i: any) => i.severity === 'high').length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Active: {filteredIncidents.filter((i: any) => i.status !== 'resolved').length}</span>
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
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <i className="fas fa-filter text-primary"></i>
              <span>Filter & Search Incidents • घटनाएं फिल्टर करें</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search incidents by description, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="input-incident-search"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="responding">Responding</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
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
            filteredIncidents.map((incident: any) => (
              <Card key={incident.id} className="spiritual-border shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getSeverityColor(incident.severity)} rounded-full flex items-center justify-center text-white`}>
                        <i className={`${getIncidentTypeIcon(incident.incidentType)} text-lg`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground capitalize">
                          {incident.incidentType.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{incident.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-card-foreground">{incident.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <i className={`${getRiskLevelIcon(incident.riskLevel)} text-primary`}></i>
                        <span>Risk Level: {incident.riskLevel}</span>
                      </div>
                      {incident.estimatedPeople && (
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-users text-primary"></i>
                          <span>{incident.estimatedPeople} people</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Assigned to:</span>
                          <div className="font-medium">{incident.assignedTo}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Reported:</span>
                          <div className="font-medium">{incident.reportedAt}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {incident.status !== 'resolved' && (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ reportId: incident.id, status: 'investigating' })}
                          data-testid={`button-investigate-${incident.id}`}
                        >
                          <i className="fas fa-search mr-2"></i>
                          Investigate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ reportId: incident.id, status: 'responding' })}
                          data-testid={`button-respond-${incident.id}`}
                        >
                          <i className="fas fa-running mr-2"></i>
                          Respond
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ reportId: incident.id, status: 'resolved' })}
                          data-testid={`button-resolve-${incident.id}`}
                        >
                          <i className="fas fa-check"></i>
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <i className="fas fa-map-marker-alt"></i>
                    </Button>
                    <Button size="sm" variant="outline">
                      <i className="fas fa-eye"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredIncidents.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-clipboard-list text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No Incidents Found</h3>
              <p className="text-muted-foreground">No incidents match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}