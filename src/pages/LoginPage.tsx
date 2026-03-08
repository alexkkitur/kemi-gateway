import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { UserRole, roleLabels } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Shield, BadgeCheck, Stamp, User } from 'lucide-react';
import kemiLogo from '@/assets/kemi-logo.png';

const roleIcons: Record<UserRole, typeof User> = {
  student: GraduationCap,
  admission_officer: Shield,
  dd_aec: BadgeCheck,
  dd_cdt: Stamp,
};

const roleDescriptions: Record<UserRole, string> = {
  student: 'Access courses, track applications & download documents',
  admission_officer: 'Verify payments & manage enrollments',
  dd_aec: 'Review and approve enrollment lists',
  dd_cdt: 'Authorize training commencement',
};

const rolePaths: Record<UserRole, string> = {
  student: '/student/dashboard',
  admission_officer: '/admin/dashboard',
  dd_aec: '/approver/dashboard',
  dd_cdt: '/authorizer/dashboard',
};

export default function LoginPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickLogin = (role: UserRole) => {
    loginAs(role);
    navigate(rolePaths[role]);
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

      {/* Login */}
      <div className="flex-1 -mt-8 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Quick Login Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {(Object.keys(roleLabels) as UserRole[]).map((role) => {
              const Icon = roleIcons[role];
              return (
                <Card
                  key={role}
                  className="cursor-pointer shadow-elevated hover:shadow-lg transition-all hover:-translate-y-1 border-0 animate-fade-in group"
                  onClick={() => handleQuickLogin(role)}
                >
                  <CardContent className="p-5 text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-foreground mb-1">
                      {roleLabels[role]}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {roleDescriptions[role]}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Login Form */}
          <Card className="max-w-md mx-auto shadow-elevated border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-heading text-xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@kemi.go.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground font-semibold h-11">
                Sign In
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Use the quick-login cards above to demo different roles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-card">
        © 2026 Kenya Education Management Institute. All rights reserved.
      </footer>
    </div>
  );
}
