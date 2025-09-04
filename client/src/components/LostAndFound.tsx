import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function LostAndFound() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isVideo, setIsVideo] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      const isVideoFile = file.type.startsWith('video/');
      
      if (isVideoFile) {
        formData.append('video', file);
        const response = await fetch('/api/lost-persons/search-video', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      } else {
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
      }
    },
    onSuccess: (data) => {
      setMatches(data.aiMatches || data.matches || []);
      setSearchResults(data);
      const totalMatches = (data.aiMatches?.length || 0) + (data.legacyMatches?.length || 0);
      toast({
        title: "AI Search Complete",
        description: `Found ${totalMatches} potential matches using advanced AI analysis.`,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsVideo(file.type.startsWith('video/'));
      setSearchResults(null);
      setMatches([]);
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

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center space-x-2">
          <i className="fas fa-search text-primary"></i>
          <span>Lost & Found</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Upload Photo</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <i className="fas fa-camera text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground mb-2">Drop image/video or click to upload</p>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="max-w-full"
                data-testid="input-lost-person-media"
              />
            </div>
            {selectedFile && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} {isVideo ? '(Video)' : '(Image)'}
                </p>
                {isVideo && (
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ Video will be analyzed for person detection
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={handleSearch}
              disabled={!selectedFile || searchMutation.isPending}
              data-testid="button-search-matches"
            >
              <i className="fas fa-search mr-2"></i>
              {searchMutation.isPending ? (isVideo ? 'Analyzing Video...' : 'Searching...') : (isVideo ? 'Analyze Video' : 'Search Matches')}
            </Button>
            
            <Link href="/lost-and-found">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-all-cases">
                <i className="fas fa-eye mr-2"></i>
                View All Cases & Reports
              </Button>
            </Link>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-card-foreground mb-2">Recent Matches</h4>
            <div className="space-y-2">
              {!searchResults ? (
                <div className="text-center py-4">
                  <i className="fas fa-search text-muted-foreground text-2xl mb-2"></i>
                  <p className="text-sm text-muted-foreground">No recent searches</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* AI Analysis Results */}
                  {searchResults.description && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">🤖 AI Analysis</h5>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{searchResults.description}</p>
                      {searchResults.detectedPersons?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Detected Persons: {searchResults.detectedPersons.length}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* AI Matches */}
                  {searchResults.aiMatches?.map((match: any, index: number) => (
                    <div key={`ai-${index}`} className="flex items-center space-x-3 text-xs p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <i className="fas fa-robot text-success-foreground"></i>
                      </div>
                      <div>
                        <div className="font-medium">🤖 AI Match - {match.confidence || 85}% confidence</div>
                        <div className="text-muted-foreground">{match.name || 'Person detected'} • {match.lastSeenLocation || 'Location unknown'}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Legacy Matches */}
                  {searchResults.legacyMatches?.map((match: any, index: number) => (
                    <div key={`legacy-${index}`} className="flex items-center space-x-3 text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-warning-foreground"></i>
                      </div>
                      <div>
                        <div className="font-medium">👤 Face Match - {Math.round(match.similarity)}% similarity</div>
                        <div className="text-muted-foreground">{match.name} • {match.lastSeenLocation}</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* No matches found */}
                  {!searchResults.aiMatches?.length && !searchResults.legacyMatches?.length && (
                    <div className="text-center py-4">
                      <i className="fas fa-info-circle text-muted-foreground text-2xl mb-2"></i>
                      <p className="text-sm text-muted-foreground">No matches found. Analysis complete.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
