import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyApplications, useCourses } from '@/hooks/use-data';
import { BookOpen, FileText, Download, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { applications, loading: appsLoading } = useMyApplications();
  const { courses } = useCourses();

  const approvedCount = applications.filter(a => a.status === 'approved' || a.status === 'authorized').length;
  const pendingCount = applications.filter(a => a.status === 'pending_verification' || a.status === 'enrolled').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your applications and training progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Applications" value={applications.length} icon={FileText} variant="primary" />
          <StatsCard title="Approved" value={approvedCount} icon={CheckCircle2} variant="success" />
          <StatsCard title="Pending" value={pendingCount} icon={Clock} variant="warning" />
          <StatsCard title="Available Courses" value={courses.length} icon={BookOpen} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {appsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No applications yet</p>
                  <Button size="sm" className="mt-3 gradient-primary text-primary-foreground" onClick={() => navigate('/student/courses')}>
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{app.course_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <AppStatusBadge status={app.status} studentFacing />
                        {app.admission_letter_url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" asChild>
                            <a href={app.admission_letter_url} target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5" /></a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
