import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background lotus-pattern mandala-bg flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 spiritual-border vintage-card vintage-glow">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-eye text-3xl text-primary-foreground"></i>
          </div>
          
          <h1 className="text-3xl font-bold font-vintage text-foreground mb-2 text-shadow-golden">
            दृष्टि Drishti
          </h1>
          
          <p className="text-muted-foreground mb-2 font-devanagari">
            महाकुंभ 2028 • Mahakumbh Command Center
          </p>
          
          <p className="text-sm text-muted-foreground mb-8 font-devanagari om-symbol">
            सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः<br/>
            <span className="text-xs opacity-75">May All Be Happy • May All Be Free From Disease</span>
          </p>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-login"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Access Command Center
          </Button>
          
          <div className="mt-6 text-xs text-muted-foreground">
            <p>Authorized Personnel Only</p>
            <p>Emergency Hotline: 108</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
