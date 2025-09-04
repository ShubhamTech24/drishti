import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, Eye, MapPin, Clock, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CrowdAnalysis {
  total_persons: number;
  crowd_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  crowd_percentage: number;
  alert_level: 'SAFE' | 'CAUTION' | 'WARNING' | 'DANGER';
  capacity: number;
  location_name: string;
  location: string;
  timestamp: number;
  feed_status: 'ACTIVE' | 'ERROR' | 'PROCESSING';
}

interface FeedData {
  success: boolean;
  analysis: CrowdAnalysis;
  error?: string;
}

const locations = [
  { id: 'ram_ghat', name: 'Ram Ghat', icon: '🛕' },
  { id: 'mahakal_temple', name: 'Mahakal Temple Entry', icon: '⛩️' },
  { id: 'triveni', name: 'Triveni Sangam', icon: '🌊' },
  { id: 'parking', name: 'Parking Area', icon: '🚗' }
];

const getAlertColor = (level: string) => {
  switch (level) {
    case 'SAFE': return 'bg-green-500';
    case 'CAUTION': return 'bg-yellow-500';
    case 'WARNING': return 'bg-orange-500';
    case 'DANGER': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getCrowdLevelColor = (level: string) => {
  switch (level) {
    case 'LOW': return 'text-green-600';
    case 'MODERATE': return 'text-yellow-600';
    case 'HIGH': return 'text-orange-600';
    case 'CRITICAL': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export function DivineVisionFeed() {
  const [selectedLocation, setSelectedLocation] = useState('ram_ghat');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const queryClient = useQueryClient();

  // Fetch crowd data for all locations
  const { data: feedData, isLoading } = useQuery({
    queryKey: ['/api/divine-vision/feeds'],
    enabled: isMonitoring,
    refetchInterval: 3000, // Update every 3 seconds
  });

  // Start/stop monitoring
  const monitoringMutation = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      return apiRequest(`/api/divine-vision/${action}`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-vision/feeds'] });
    },
  });

  // Process video feed for specific location
  const processFeedMutation = useMutation({
    mutationFn: async (location: string) => {
      return apiRequest(`/api/divine-vision/process-feed`, {
        method: 'POST',
        body: JSON.stringify({ location }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-vision/feeds'] });
    },
  });

  const handleToggleMonitoring = () => {
    const action = isMonitoring ? 'stop' : 'start';
    monitoringMutation.mutate(action);
    setIsMonitoring(!isMonitoring);
  };

  const handleProcessFeed = (location: string) => {
    processFeedMutation.mutate(location);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Divine Vision Feed</h2>
          <p className="text-muted-foreground">
            Real-time crowd monitoring at key Mahakumbh locations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="text-sm">
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-1" />
                Live Monitoring
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Monitoring Stopped
              </>
            )}
          </Badge>
          <Button
            onClick={handleToggleMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            data-testid="button-toggle-monitoring"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>
      </div>

      {/* Location Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((location) => {
          const locationData = feedData?.find((feed: FeedData) => 
            feed.analysis?.location === location.id
          );
          
          return (
            <Card 
              key={location.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedLocation === location.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedLocation(location.id)}
              data-testid={`card-location-${location.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{location.icon}</span>
                    {location.name}
                  </CardTitle>
                  {locationData?.analysis && (
                    <div 
                      className={`w-3 h-3 rounded-full ${getAlertColor(locationData.analysis.alert_level)}`}
                      data-testid={`status-${location.id}`}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {locationData?.analysis ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">People:</span>
                      <span className="font-semibold" data-testid={`count-${location.id}`}>
                        {locationData.analysis.total_persons}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Level:</span>
                      <span className={`text-sm font-medium ${getCrowdLevelColor(locationData.analysis.crowd_level)}`}>
                        {locationData.analysis.crowd_level}
                      </span>
                    </div>
                    <Progress 
                      value={locationData.analysis.crowd_percentage} 
                      className="h-2"
                      data-testid={`progress-${location.id}`}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {isMonitoring ? 'Connecting...' : 'Not monitoring'}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Feed Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Feed - {locations.find(l => l.id === selectedLocation)?.name}
              </CardTitle>
              <CardDescription>
                AI-powered person counting and crowd analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <p className="text-sm text-muted-foreground">Video Feed Simulation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {locations.find(l => l.id === selectedLocation)?.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => handleProcessFeed(selectedLocation)}
                  disabled={processFeedMutation.isPending}
                  size="sm"
                  data-testid="button-process-feed"
                >
                  {processFeedMutation.isPending ? 'Processing...' : 'Analyze Current Frame'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled
                  data-testid="button-upload-video"
                >
                  Upload Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crowd Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crowd Analytics
              </CardTitle>
              <CardDescription>
                Real-time crowd density and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const locationData = feedData?.find((feed: FeedData) => 
                  feed.analysis?.location === selectedLocation
                );
                
                if (!locationData?.analysis) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No crowd data available</p>
                      <p className="text-sm mt-1">Start monitoring to see analytics</p>
                    </div>
                  );
                }

                const analysis = locationData.analysis;
                
                return (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold" data-testid="text-total-persons">
                          {analysis.total_persons}
                        </div>
                        <div className="text-sm text-muted-foreground">Total People</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold" data-testid="text-capacity-percentage">
                          {analysis.crowd_percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                      </div>
                    </div>

                    {/* Crowd Level */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Crowd Level:</span>
                        <Badge 
                          variant={analysis.crowd_level === 'CRITICAL' ? 'destructive' : 'default'}
                          data-testid="badge-crowd-level"
                        >
                          {analysis.crowd_level}
                        </Badge>
                      </div>
                      <Progress 
                        value={analysis.crowd_percentage} 
                        className="h-3"
                        data-testid="progress-crowd-capacity"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>{analysis.capacity} (Max Capacity)</span>
                      </div>
                    </div>

                    {/* Alert Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-4 h-4 rounded-full ${getAlertColor(analysis.alert_level)}`} />
                      <div className="flex-1">
                        <div className="font-medium">Alert Level: {analysis.alert_level}</div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.alert_level === 'SAFE' && 'Normal crowd levels, no action required'}
                          {analysis.alert_level === 'CAUTION' && 'Moderate crowd, monitor closely'}
                          {analysis.alert_level === 'WARNING' && 'High crowd density, consider crowd control measures'}
                          {analysis.alert_level === 'DANGER' && 'Critical crowd level, immediate action required'}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Last updated: {new Date(analysis.timestamp * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Alerts */}
      {feedData?.some((feed: FeedData) => feed.analysis?.alert_level === 'DANGER') && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Emergency Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">
              Critical crowd density detected at one or more locations. Immediate crowd management required.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}