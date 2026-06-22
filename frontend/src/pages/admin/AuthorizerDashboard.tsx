import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllApplications, authorizeTraining } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Stamp, ClipboardList, PlayCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

export default function AuthorizerDashboard() {
  const { applications, loading, refetch } = useAllApplications();
  const { user } = useAuth();

  const approvedApps = useMemo(() => applications.filter(a => a.status === 'approved' || a.status === 'authorized'), [applications]);
  const pendingAuth = applications.filter(a => a.status === 'approved').length;
  const authorized = applications.filter(a => a.status === 'authorized').length;

  const handleAuthorize = async (appId: string) => {
    if (!user) return;
    await authorizeTraining(appId, user.id);
    toast.success('Training authorized!');
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">DD/CD&T Authorizer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorize training commencement and track batches</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatsCard title="Pending Auth" value={pendingAuth} icon={Clock} variant="warning" />
          <StatsCard title="Authorized" value={authorized} icon={Stamp} variant="success" />
          <StatsCard title="Total Approved" value={approvedApps.length} icon={ClipboardList} variant="primary" />
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base sm:text-lg">Approved Trainees</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Authorize training commencement for approved applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : approvedApps.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No approved applications yet.</p>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden space-y-3">
                  {approvedApps.map(app => (
                    <div key={app.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                        </div>
                        <AppStatusBadge status={app.status} />
                      </div>
                      {app.status === 'approved' ? (
                        <Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground" onClick={() => handleAuthorize(app.id)}>
                          <PlayCircle className="h-3 w-3 mr-1" /> Authorize
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedApps.map(app => (
                        <TableRow key={app.id} className="hover:bg-muted/30">
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                            <p className="text-xs text-muted-foreground">{app.student_email}</p>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{app.course_title}</TableCell>
                          <TableCell><AppStatusBadge status={app.status} /></TableCell>
                          <TableCell className="text-right">
                            {app.status === 'approved' ? (
                              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleAuthorize(app.id)}>
                                <PlayCircle className="h-3.5 w-3.5 mr-1" /> Authorize
                              </Button>
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-success inline-block" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
