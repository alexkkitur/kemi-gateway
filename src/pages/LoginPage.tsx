import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import kemiLogo from '@/assets/kemi-logo.png';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    const error = await login(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (signupPassword !== signupConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const error = await signup(signupEmail, signupPassword, signupName);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! Please check your email to verify your account.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="gradient-hero text-primary-foreground py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <img src={kemiLogo} alt="KEMI Logo" className="h-20 mx-auto mb-6 bg-primary-foreground/90 rounded-lg px-4 py-2" />
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Training Enrollment & Student Portal
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Kenya Education Management Institute — Digitized Registration, Admission, Approval & Student Engagement System
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 -mt-8 px-6 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-elevated border-0 animate-fade-in">
            <Tabs defaultValue="login">
              <CardHeader className="text-center pb-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-center">Enter your credentials to access the portal</CardDescription>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input id="login-email" type="email" placeholder="your.email@kemi.go.ke" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-center">Register as a new student trainee</CardDescription>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" placeholder="John Kamau" value={signupName} onChange={e => setSignupName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input id="signup-email" type="email" placeholder="your.email@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Min. 6 characters" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input id="signup-confirm" type="password" placeholder="••••••••" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold h-11" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Create Student Account
                    </Button>
                  </CardContent>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-card">
        © 2026 Kenya Education Management Institute. All rights reserved.
      </footer>
    </div>
  );
}
