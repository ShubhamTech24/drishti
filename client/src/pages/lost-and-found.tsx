import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LostPerson } from "@shared/schema";
import { Link } from "wouter";

export default function LostAndFoundPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [reportForm, setReportForm] = useState({
    name: '',
    age: '',
    description: '',
    lastSeenLocation: '',
    contactNumber: ''
  });

  const { data: lostPersons = [], isLoading } = useQuery<LostPerson[]>({
    queryKey: ['/api/lost-persons'],
    refetchInterval: 30000,
  });

  const searchMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/lost-persons/search', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMatches(data.matches || []);
      toast({
        title: "Search Complete",
        description: `Found ${data.matches?.length || 0} potential matches.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Search Failed",
        description: "Unable to search for matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/lost-persons/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to report lost person');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Lost person report has been created and distributed.",
      });
      setReportForm({
        name: '',
        age: '',
        description: '',
        lastSeenLocation: '',
        contactNumber: ''
      });
    },
  });

  // Mock data for demonstration
  const mockLostPersons = [
    {
      id: 'lp001',
      name: 'आशा देवी (Asha Devi)',
      age: 65,
      description: 'Wearing white saree, silver bangles, speaks Hindi only',
      lastSeenLocation: 'Ram Ghat near Temple',
      contactNumber: '+91-9876543216',
      reportedAt: '2 hours ago',
      status: 'searching',
      reportedBy: 'Family Member'
    },
    {
      id: 'lp002', 
      name: 'छोटू (Chotu)',
      age: 8,
      description: 'Boy in blue kurta, speaks Hindi and Marathi',
      lastSeenLocation: 'Food Court Area',
      contactNumber: '+91-9876543217',
      reportedAt: '45 minutes ago',
      status: 'found',
      reportedBy: 'Volunteer'
    },
    {
      id: 'lp003',
      name: 'राज कुमार (Raj Kumar)',
      age: 45,
      description: 'Man in white dhoti, has hearing disability',
      lastSeenLocation: 'Transit Hub-B',
      contactNumber: '+91-9876543218',
      reportedAt: '3 hours ago',
      status: 'searching',
      reportedBy: 'Family Member'
    }
  ];

  const displayLostPersons = lostPersons.length > 0 ? lostPersons : mockLostPersons;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSearch = () => {
    if (!selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to search for matches.",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(selectedFile);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate(reportForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching': return 'bg-yellow-500';
      case 'found': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
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
                  <p className="text-sm opacity-90 font-devanagari">Lost & Found • खो जाने वाले व्यक्ति</p>
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
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" data-testid="tab-search">
              <i className="fas fa-search mr-2"></i>
              Face Search • चेहरा खोज
            </TabsTrigger>
            <TabsTrigger value="report" data-testid="tab-report">
              <i className="fas fa-plus mr-2"></i>
              Report Missing • रिपोर्ट करें
            </TabsTrigger>
            <TabsTrigger value="database" data-testid="tab-database">
              <i className="fas fa-database mr-2"></i>
              Active Cases • सक्रिय मामले
            </TabsTrigger>
          </TabsList>

          {/* Face Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="spiritual-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <i className="fas fa-camera text-primary"></i>
                  <span>AI-Powered Face Recognition • AI चेहरा पहचान</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    data-testid="input-image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <i className="fas fa-image text-4xl text-primary"></i>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground"></i>
                        <p className="text-sm">Click to upload image or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={!selectedFile || searchMutation.isPending}
                  className="w-full"
                  data-testid="button-start-search"
                >
                  {searchMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Searching Database...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search mr-2"></i>
                      Start Face Recognition Search
                    </>
                  )}
                </Button>

                {matches.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Search Results ({matches.length} matches found)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.map((match: any, index: number) => (
                        <Card key={index} className="border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                                <i className="fas fa-user"></i>
                              </div>
                              <div>
                                <p className="font-semibold">{match.name}</p>
                                <p className="text-sm text-muted-foreground">Confidence: {match.confidence}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Missing Tab */}
          <TabsContent value="report" className="space-y-6">
            <Card className="spiritual-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <i className="fas fa-user-plus text-primary"></i>
                  <span>Report Missing Person • खोया व्यक्ति रिपोर्ट करें</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name • पूरा नाम</label>
                      <Input
                        value={reportForm.name}
                        onChange={(e) => setReportForm({...reportForm, name: e.target.value})}
                        placeholder="Enter full name"
                        required
                        data-testid="input-person-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Age • आयु</label>
                      <Input
                        type="number"
                        value={reportForm.age}
                        onChange={(e) => setReportForm({...reportForm, age: e.target.value})}
                        placeholder="Age in years"
                        required
                        data-testid="input-person-age"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description • विवरण</label>
                    <Textarea
                      value={reportForm.description}
                      onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                      placeholder="Physical description, clothing, distinguishing features..."
                      required
                      data-testid="textarea-person-description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Seen Location • अंतिम स्थान</label>
                    <Input
                      value={reportForm.lastSeenLocation}
                      onChange={(e) => setReportForm({...reportForm, lastSeenLocation: e.target.value})}
                      placeholder="Where was the person last seen?"
                      required
                      data-testid="input-last-location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Number • संपर्क नंबर</label>
                    <Input
                      type="tel"
                      value={reportForm.contactNumber}
                      onChange={(e) => setReportForm({...reportForm, contactNumber: e.target.value})}
                      placeholder="+91-XXXXXXXXXX"
                      required
                      data-testid="input-contact-number"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={reportMutation.isPending}
                    data-testid="button-submit-report"
                  >
                    {reportMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Submitting Report...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Submit Missing Person Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Cases Tab */}
          <TabsContent value="database" className="space-y-6">
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
                displayLostPersons.map((person: any) => (
                  <Card key={person.id} className="spiritual-border shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 ${getStatusColor(person.status)} rounded-full flex items-center justify-center text-white`}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground">{person.name}</h3>
                            <p className="text-sm text-muted-foreground">Age: {person.age}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm"><strong>Description:</strong> {person.description}</p>
                        <p className="text-sm"><strong>Last Seen:</strong> {person.lastSeenLocation}</p>
                        <p className="text-sm"><strong>Contact:</strong> {person.contactNumber}</p>
                        <p className="text-xs text-muted-foreground">Reported {person.reportedAt} by {person.reportedBy}</p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <i className="fas fa-phone mr-2"></i>
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-map-marker-alt"></i>
                        </Button>
                        {person.status === 'searching' && (
                          <Button size="sm" variant="outline" className="text-green-600">
                            <i className="fas fa-check"></i>
                          </Button>
                        )}
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