import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function LostAndFound() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [matches, setMatches] = useState<any[]>([]);

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
              <p className="text-sm text-muted-foreground mb-2">Drop image or click to upload</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="max-w-full"
                data-testid="input-lost-person-image"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          <Button 
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={handleSearch}
            disabled={!selectedFile || searchMutation.isPending}
            data-testid="button-search-matches"
          >
            <i className="fas fa-search mr-2"></i>
            {searchMutation.isPending ? 'Searching...' : 'Search Matches'}
          </Button>
          
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-card-foreground mb-2">Recent Matches</h4>
            <div className="space-y-2">
              {matches.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-search text-muted-foreground text-2xl mb-2"></i>
                  <p className="text-sm text-muted-foreground">No recent searches</p>
                </div>
              ) : (
                matches.map((match, index) => (
                  <div key={index} className="flex items-center space-x-3 text-xs">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-success-foreground"></i>
                    </div>
                    <div>
                      <div className="font-medium">Match found - 87% confidence</div>
                      <div className="text-muted-foreground">Located at {match.lastSeenLocation || 'Unknown'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
