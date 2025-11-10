import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AuthMode = "login" | "register";
type UserRole = "individual" | "ngo" | "organization";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("individual");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Use VITE_API_URL for Vite projects (not import.meta.env.VITE_API_URL)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('API URL:', API_URL); // Debug log

    try {
      if (mode === 'register') {
        const userData = { 
          name: displayName, 
          email, 
          password, 
          role 
        };
        
        console.log('Sending registration data:', userData); // Debug log

        const res = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for cookies
          body: JSON.stringify(userData),
        });

        const body = await res.json();
        console.log('Registration response:', { status: res.status, body }); // Debug log

        if (!res.ok) {
          throw new Error(body.error || body.message || `Registration failed with status ${res.status}`);
        }

        // Check if auto-verified (has token) or needs manual verification
        if (body.token) {
          localStorage.setItem('token', body.token);
          localStorage.setItem('user', JSON.stringify(body.data?.user));
          toast.success('Account created and verified! Redirecting...');
          navigate('/');
        } else {
          toast.success('Account created! Please wait for verification.');
          setMode('login');
          // Clear form
          setDisplayName('');
          setEmail('');
          setPassword('');
        }
    } else {
  // LOGIN
  const loginData = { email, password };
  console.log('Sending login data:', loginData); // Debug log

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify(loginData),
  });

  const body = await res.json();
  console.log('Login response:', { status: res.status, body }); // Debug log

  if (!res.ok) {
    throw new Error(body.error || body.message || `Login failed with status ${res.status}`);
  }

  // ⭐⭐⭐ NEW DEBUG VERSION ⭐⭐⭐
  // Store JWT and user info
  if (body.token) {
    localStorage.setItem('token', body.token);
    console.log('✅ Token stored in localStorage');
  }
  if (body.data?.user) {
    localStorage.setItem('user', JSON.stringify(body.data.user));
    console.log('✅ User data stored in localStorage:', body.data.user);
  }

  console.log('🔄 Attempting navigation to /');
  toast.success('Welcome back!');
  navigate('/', { replace: true }); // Add replace: true to clear history
      }

    } catch (error: any) {
      console.error('Auth error:', error); // Debug log
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md animate-slide-up shadow-primary">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Community Connect
          </CardTitle>
          <CardDescription className="text-center text-base">
            {mode === "login" ? "Welcome back! Sign in to continue" : "Join our community today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                // Clear form when switching modes
                setDisplayName('');
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-primary hover:underline"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};