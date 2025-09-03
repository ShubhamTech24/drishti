import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function AlertBroadcast() {
  const { toast } = useToast();
  const [targetZone, setTargetZone] = useState("all");
  const [selectedLanguages, setSelectedLanguages] = useState({
    hindi: true,
    english: true,
    marathi: false,
    sanskrit: false
  });
  const [alertType, setAlertType] = useState("crowd_guidance");

  const generateAlertMutation = useMutation({
    mutationFn: async () => {
      const languages = Object.entries(selectedLanguages)
        .filter(([_, selected]) => selected)
        .map(([lang, _]) => lang);

      await apiRequest('POST', '/api/alerts/generate', {
        zone: targetZone,
        languages,
        alertType
      });
    },
    onSuccess: () => {
      toast({
        title: "Alert Generated",
        description: "Multilingual alert has been broadcast to selected zones.",
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
        title: "Error",
        description: "Failed to generate alert.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="spiritual-border shadow-lg sacred-card divine-glow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-card-foreground flex items-center space-x-2 font-vintage text-shadow-golden floating-om">
            <i className="fas fa-broadcast-tower text-primary divine-glow"></i>
            <span>Alert Broadcast</span>
          </h3>
          <Link href="/alerts">
            <Button size="sm" variant="outline" data-testid="button-view-all-alerts">
              <i className="fas fa-eye mr-2"></i>
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Target Zone</label>
            <Select value={targetZone} onValueChange={setTargetZone}>
              <SelectTrigger data-testid="select-target-zone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="ram_ghat">Ram Ghat</SelectItem>
                <SelectItem value="mahakal">Mahakal Temple</SelectItem>
                <SelectItem value="triveni">Triveni Sangam</SelectItem>
                <SelectItem value="transit">Transit Hubs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Languages • भाषाएं</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hindi"
                  checked={selectedLanguages.hindi}
                  onCheckedChange={(checked) => 
                    setSelectedLanguages(prev => ({ ...prev, hindi: !!checked }))
                  }
                  data-testid="checkbox-hindi"
                />
                <label htmlFor="hindi" className="text-sm font-devanagari">Hindi हिंदी</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="english"
                  checked={selectedLanguages.english}
                  onCheckedChange={(checked) => 
                    setSelectedLanguages(prev => ({ ...prev, english: !!checked }))
                  }
                  data-testid="checkbox-english"
                />
                <label htmlFor="english" className="text-sm">English</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="marathi"
                  checked={selectedLanguages.marathi}
                  onCheckedChange={(checked) => 
                    setSelectedLanguages(prev => ({ ...prev, marathi: !!checked }))
                  }
                  data-testid="checkbox-marathi"
                />
                <label htmlFor="marathi" className="text-sm font-devanagari">Marathi मराठी</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sanskrit"
                  checked={selectedLanguages.sanskrit}
                  onCheckedChange={(checked) => 
                    setSelectedLanguages(prev => ({ ...prev, sanskrit: !!checked }))
                  }
                  data-testid="checkbox-sanskrit"
                />
                <label htmlFor="sanskrit" className="text-sm font-devanagari">Sanskrit संस्कृत</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Alert Type</label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger data-testid="select-alert-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crowd_guidance">Crowd Guidance</SelectItem>
                <SelectItem value="exit_instructions">Exit Instructions</SelectItem>
                <SelectItem value="safety_advisory">Safety Advisory</SelectItem>
                <SelectItem value="emergency_evacuation">Emergency Evacuation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90 font-semibold"
            onClick={() => generateAlertMutation.mutate()}
            disabled={generateAlertMutation.isPending}
            data-testid="button-generate-alert"
          >
            <i className="fas fa-bullhorn mr-2"></i>
            {generateAlertMutation.isPending ? 'Generating...' : 'Generate & Broadcast Alert'}
          </Button>
          
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <i className="fas fa-info-circle mr-1"></i>
            AI will generate appropriate calming instructions in selected languages
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
