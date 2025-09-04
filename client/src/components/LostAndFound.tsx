import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function LostAndFound() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [searchMediaFile, setSearchMediaFile] = useState<File | null>(null);
  const [targetPersonFile, setTargetPersonFile] = useState<File | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const searchMediaRef = useRef<HTMLInputElement>(null);
  const targetPersonRef = useRef<HTMLInputElement>(null);

  // Two-step search mutation
  const twoStepSearchMutation = useMutation({
    mutationFn: async ({ searchMedia, targetPerson }: { searchMedia: File; targetPerson: File }) => {
      const formData = new FormData();
      formData.append('searchMedia', searchMedia);
      formData.append('targetPerson', targetPerson);

      const response = await fetch('/api/lost-persons/two-step-search', {
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
      setSearchResult(data);
      toast({
        title: "Search Complete",
        description: data.searchResult.found 
          ? `Person found with ${data.searchResult.confidence}% confidence!` 
          : "Person not found in the uploaded media.",
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
        description: "Unable to perform search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearchMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSearchMediaFile(file);
      setSearchResult(null);
    }
  };

  const handleTargetPersonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTargetPersonFile(file);
    }
  };

  const handleStepComplete = () => {
    if (step === 1 && searchMediaFile) {
      setStep(2);
    } else if (step === 2 && searchMediaFile && targetPersonFile) {
      twoStepSearchMutation.mutate({ searchMedia: searchMediaFile, targetPerson: targetPersonFile });
    }
  };

  const resetSearch = () => {
    setStep(1);
    setSearchMediaFile(null);
    setTargetPersonFile(null);
    setSearchResult(null);
    if (searchMediaRef.current) searchMediaRef.current.value = '';
    if (targetPersonRef.current) targetPersonRef.current.value = '';
  };

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center space-x-2">
            <i className="fas fa-search text-primary"></i>
            <span>Lost & Found AI Search</span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-6 h-6 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'} flex items-center justify-center text-xs font-bold`}>1</div>
            <div className="w-8 h-0.5 bg-muted"></div>
            <div className={`w-6 h-6 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'} flex items-center justify-center text-xs font-bold`}>2</div>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Step 1: Upload Search Media */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Step 1: Upload Search Media (Image/Video) 📸
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload an image or video that might contain the missing person
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <i className="fas fa-cloud-upload-alt text-muted-foreground text-2xl mb-2"></i>
                  <p className="text-sm text-muted-foreground mb-2">Drop image/video or click to upload</p>
                  <Input
                    ref={searchMediaRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleSearchMediaSelect}
                    className="max-w-full"
                    data-testid="input-search-media"
                  />
                </div>
                {searchMediaFile && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Selected: {searchMediaFile.name} ({searchMediaFile.type.startsWith('video/') ? 'Video' : 'Image'})
                    </p>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full"
                onClick={handleStepComplete}
                disabled={!searchMediaFile}
                data-testid="button-next-step"
              >
                <i className="fas fa-arrow-right mr-2"></i>
                Next: Upload Target Person
              </Button>
            </div>
          )}

          {/* Step 2: Upload Target Person */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ Search media uploaded: {searchMediaFile?.name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Step 2: Upload Target Person Image 👤
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a clear photo of the person you're looking for
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <i className="fas fa-user text-muted-foreground text-2xl mb-2"></i>
                  <p className="text-sm text-muted-foreground mb-2">Drop target person image</p>
                  <Input
                    ref={targetPersonRef}
                    type="file"
                    accept="image/*"
                    onChange={handleTargetPersonSelect}
                    className="max-w-full"
                    data-testid="input-target-person"
                  />
                </div>
                {targetPersonFile && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✅ Selected: {targetPersonFile.name}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  data-testid="button-back-step"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleStepComplete}
                  disabled={!targetPersonFile || twoStepSearchMutation.isPending}
                  data-testid="button-start-search"
                >
                  <i className="fas fa-search mr-2"></i>
                  {twoStepSearchMutation.isPending ? 'Searching...' : 'Start AI Search'}
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResult && (
            <div className="mt-6 space-y-3">
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-card-foreground mb-3 flex items-center">
                  <i className="fas fa-robot mr-2 text-primary"></i>
                  AI Search Results
                </h4>
                
                {searchResult.searchResult.found ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-white text-sm"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-300">
                          Person Found! ({searchResult.searchResult.confidence}% confidence)
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          📍 {searchResult.searchResult.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        🤖 <strong>AI Analysis:</strong> {searchResult.searchResult.description}
                      </p>
                    </div>
                    
                    {searchResult.searchResult.matchDetails && Object.keys(searchResult.searchResult.matchDetails).length > 0 && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Match Details:</p>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(searchResult.searchResult.matchDetails, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <i className="fas fa-times text-white text-sm"></i>
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        Person Not Found
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🤖 AI Analysis: {searchResult.searchResult.description || 'The target person was not detected in the uploaded media.'}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline"
                  onClick={resetSearch}
                  className="w-full mt-3"
                  data-testid="button-new-search"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Start New Search
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t pt-4">
            <Link href="/lost-and-found">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-all-cases">
                <i className="fas fa-eye mr-2"></i>
                View All Lost Person Cases
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}