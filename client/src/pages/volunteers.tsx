import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Volunteer } from "@shared/schema";
import { Link } from "wouter";

export default function VolunteersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: volunteers = [], isLoading } = useQuery<Volunteer[]>({
    queryKey: ['/api/volunteers'],
    refetchInterval: 30000,
  });

  const deployMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      const response = await fetch(`/api/volunteers/${volunteerId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to deploy volunteer');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Volunteer Deployed",
        description: "The volunteer has been successfully deployed.",
      });
    },
  });

  // Mock data for demonstration
  const mockVolunteers = [
    { id: 'v001', name: 'राम शर्मा (Ram Sharma)', currentZone: 'Ram Ghat Zone-A', status: 'available', contactNumber: '+91-9876543210', specialization: 'First Aid', responseTimeAvg: 1.2, totalAssignments: 15 },
    { id: 'v002', name: 'सीता देवी (Sita Devi)', currentZone: 'Mahakal Temple', status: 'assigned', contactNumber: '+91-9876543211', specialization: 'Crowd Management', responseTimeAvg: 2.1, totalAssignments: 23 },
    { id: 'v003', name: 'विकास यादव (Vikas Yadav)', currentZone: 'Transit Hub-B', status: 'on_break', contactNumber: '+91-9876543212', specialization: 'Security', responseTimeAvg: 1.8, totalAssignments: 18 },
    { id: 'v004', name: 'अनिता सिंह (Anita Singh)', currentZone: 'Shipra Ghat', status: 'available', contactNumber: '+91-9876543213', specialization: 'Medical Support', responseTimeAvg: 1.5, totalAssignments: 31 },
    { id: 'v005', name: 'गोविंद पटेल (Govind Patel)', currentZone: 'Parking Zone-C', status: 'offline', contactNumber: '+91-9876543214', specialization: 'Traffic Management', responseTimeAvg: 2.3, totalAssignments: 12 },
    { id: 'v006', name: 'सुनीता वर्मा (Sunita Verma)', currentZone: 'Food Court', status: 'available', contactNumber: '+91-9876543215', specialization: 'Translation Services', responseTimeAvg: 1.9, totalAssignments: 27 }
  ];

  const displayVolunteers = volunteers.length > 0 ? volunteers : mockVolunteers;
  
  const filteredVolunteers = displayVolunteers.filter((volunteer: any) =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.currentZone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'assigned': return 'bg-blue-500';
      case 'on_break': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available • उपलब्ध';
      case 'assigned': return 'En Route • मार्ग में';
      case 'on_break': return 'On Break • विराम पर';
      case 'offline': return 'Offline • ऑफ़लाइन';
      default: return status;
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
                  <p className="text-sm opacity-90 font-devanagari">Volunteer Management • स्वयंसेवक प्रबंधन</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
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
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <i className="fas fa-search text-primary"></i>
              <span>Search & Filter Volunteers • स्वयंसेवक खोजें</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by name, zone, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="input-volunteer-search"
              />
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Available: {filteredVolunteers.filter((v: any) => v.status === 'available').length}
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Assigned: {filteredVolunteers.filter((v: any) => v.status === 'assigned').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volunteers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            filteredVolunteers.map((volunteer: any) => (
              <Card key={volunteer.id} className="spiritual-border shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getStatusColor(volunteer.status)} rounded-full flex items-center justify-center text-white`}>
                        <i className="fas fa-user text-lg"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{volunteer.name}</h3>
                        <p className="text-sm text-muted-foreground">{volunteer.contactNumber}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(volunteer.status)}>
                      {getStatusText(volunteer.status)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span className="text-sm">{volunteer.currentZone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-star text-primary"></i>
                      <span className="text-sm">{volunteer.specialization}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Avg Response:</span>
                        <div className="font-medium">{volunteer.responseTimeAvg}min</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Tasks:</span>
                        <div className="font-medium">{volunteer.totalAssignments}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={volunteer.status === 'offline' || deployMutation.isPending}
                      onClick={() => deployMutation.mutate(volunteer.id)}
                      data-testid={`button-deploy-${volunteer.id}`}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline">
                      <i className="fas fa-phone"></i>
                    </Button>
                    <Button size="sm" variant="outline">
                      <i className="fas fa-map"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredVolunteers.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No Volunteers Found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}