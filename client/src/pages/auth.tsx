import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function AuthPage() {
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState<LoginData>({
    username: "",
    password: "",
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "volunteer",
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName || data.user.username}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      window.location.href = '/'; // Redirect to dashboard
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: `Welcome to Drishti, ${data.user.firstName || data.user.username}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      window.location.href = '/'; // Redirect to dashboard
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-6xl font-bold text-orange-600 dark:text-orange-400 mb-4">
            🙏 दृष्टि 🙏
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Mahakumbh 2028 Command Center
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Advanced AI-powered crowd monitoring and safety management system for the world's largest religious gathering
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="text-2xl">👁️</span>
              <span className="text-gray-700 dark:text-gray-300">AI Vision & Crowd Analysis</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="text-2xl">🚨</span>
              <span className="text-gray-700 dark:text-gray-300">Multi-language Emergency Alerts</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="text-2xl">🤝</span>
              <span className="text-gray-700 dark:text-gray-300">24/7 Help & Coordination</span>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Access Drishti System</CardTitle>
            <CardDescription>
              Login or create account to access the command center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      data-testid="input-login-username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      data-testid="input-login-password"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstname">First Name</Label>
                      <Input
                        id="register-firstname"
                        type="text"
                        placeholder="First name"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        data-testid="input-register-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastname">Last Name</Label>
                      <Input
                        id="register-lastname"
                        type="text"
                        placeholder="Last name"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        data-testid="input-register-lastname"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username *</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      data-testid="input-register-username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      data-testid="input-register-email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      data-testid="input-register-password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <Select 
                      value={registerForm.role} 
                      onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                    >
                      <SelectTrigger data-testid="select-register-role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}