import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockApplications, mockCourses } from '@/lib/mock-data';
import { BookOpen, FileText, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const myApps = mockApplications.filter(a => a.studentId === '1');
  const approvedCount = myApps.filter(a => a.status === 'approved' || a.status === 'authorized').length;
  const pendingCount = myApps.filter(a => a.status === 'pending_verification').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your applications and training progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Applications" value={myApps.length} icon={FileText} variant="primary" />
          <StatsCard title="Approved" value={approvedCount} icon={CheckCircle2} variant="success" />
          <StatsCard title="Pending" value={pendingCount} icon={Clock} variant="warning" />
          <StatsCard title="Available Courses" value={mockCourses.length} icon={BookOpen} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2 shadow-card border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-lg">My Applications</CardTitle>
                  <CardDescription>Recent training applications</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/student/applications')}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.courseTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Applied: {app.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <AppStatusBadge status={app.status} studentFacing />
                      {app.admissionLetter && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gradient-primary text-primary-foreground" onClick={() => navigate('/student/courses')}>
                <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/student/applications')}>
                <FileText className="h-4 w-4 mr-2" /> Track Applications
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/student/documents')}>
                <Download className="h-4 w-4 mr-2" /> My Documents
              </Button>

              <div className="pt-3 mt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">Application for Strategic Leadership approved</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                    <span className="text-foreground">Payment verification pending for ICT course</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
