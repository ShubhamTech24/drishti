import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function DatabaseSearch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Get stored media query
  const { data: storedMedia, isLoading: loadingMedia } = useQuery({
    queryKey: ['/api/media'],
    enabled: activeTab === 'search'
  });

  // Upload media mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch('/api/media/upload', {
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
      toast({
        title: "Media Uploaded Successfully",
        description: `${data.filename} uploaded with ${data.detectedPersons} persons detected`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setUploadFile(null);
      if (uploadRef.current) uploadRef.current.value = '';
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
        title: "Upload Failed",
        description: "Unable to upload media. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Search in database mutation
  const searchMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('targetPerson', file);

      const response = await fetch('/api/lost-persons/search-in-database', {
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
      setSearchResults(data);
      toast({
        title: "Database Search Complete",
        description: `Found ${data.matchesFound} matches across ${data.totalMediaSearched} media files`,
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
        description: "Unable to search database. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleSearchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSearchFile(file);
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleSearch = () => {
    if (searchFile) {
      searchMutation.mutate(searchFile);
    }
  };

  return (
    <Card className="spiritual-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center space-x-2">
            <i className="fas fa-database text-primary"></i>
            <span>Database-Powered Search</span>
          </h3>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'upload' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('upload')}
              data-testid="tab-upload"
            >
              📤 Upload Media
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('search')}
              data-testid="tab-search"
            >
              🔍 Search Database
            </Button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Upload Live Feed or Images to Database 📸
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload images or videos to build your searchable database. AI will analyze and detect persons automatically.
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <i className="fas fa-cloud-upload-alt text-muted-foreground text-2xl mb-2"></i>
                <p className="text-sm text-muted-foreground mb-2">Drop media files or click to upload</p>
                <Input
                  ref={uploadRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUploadSelect}
                  className="max-w-full"
                  data-testid="input-upload-media"
                />
              </div>
              {uploadFile && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ✅ Selected: {uploadFile.name} ({uploadFile.type.startsWith('video/') ? 'Video' : 'Image'})
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full"
              onClick={handleUpload}
              disabled={!uploadFile || uploadMutation.isPending}
              data-testid="button-upload"
            >
              <i className="fas fa-upload mr-2"></i>
              {uploadMutation.isPending ? 'Uploading & Analyzing...' : 'Upload to Database'}
            </Button>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                📊 Database Status: {loadingMedia ? 'Loading...' : `${storedMedia?.length || 0} media files stored`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Search for Lost Person in Database 👤
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload a photo of the person you're looking for. AI will search through all stored media.
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <i className="fas fa-user-search text-muted-foreground text-2xl mb-2"></i>
                <p className="text-sm text-muted-foreground mb-2">Drop target person image</p>
                <Input
                  ref={searchRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSearchSelect}
                  className="max-w-full"
                  data-testid="input-search-person"
                />
              </div>
              {searchFile && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✅ Selected: {searchFile.name}
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full"
              onClick={handleSearch}
              disabled={!searchFile || searchMutation.isPending || !storedMedia?.length}
              data-testid="button-search-database"
            >
              <i className="fas fa-search mr-2"></i>
              {searchMutation.isPending ? 'Searching Database...' : 'Search All Stored Media'}
            </Button>

            {/* Search Results */}
            {searchResults && (
              <div className="mt-6 space-y-3">
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-card-foreground mb-3 flex items-center">
                    <i className="fas fa-search-plus mr-2 text-primary"></i>
                    Database Search Results
                  </h4>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      🔍 Searched {searchResults.totalMediaSearched} media files • Found {searchResults.matchesFound} matches
                    </p>
                  </div>

                  {searchResults.matchesFound === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <i className="fas fa-times text-white text-sm"></i>
                        </div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          No Matches Found
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        The person was not found in any of the stored media files. Try uploading more media or check the image quality.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.results.map((result: any, index: number) => (
                        <div key={result.mediaId} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-green-700 dark:text-green-300">
                                Found in: {result.filename} ({result.searchResult.confidence}% confidence)
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                📍 {result.searchResult.location}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              🤖 <strong>AI Analysis:</strong> {result.searchResult.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchResults(null);
                      setSearchFile(null);
                      if (searchRef.current) searchRef.current.value = '';
                    }}
                    className="w-full mt-3"
                    data-testid="button-new-search"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    New Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}