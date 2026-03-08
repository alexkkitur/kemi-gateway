import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockApplications } from '@/lib/mock-data';
import { Stamp, ClipboardList, PlayCircle, CheckCircle2, Clock } from 'lucide-react';

export default function AuthorizerDashboard() {
  const approvedApps = mockApplications.filter(a => a.status === 'approved' || a.status === 'authorized');
  const pendingAuth = mockApplications.filter(a => a.status === 'approved').length;
  const authorized = mockApplications.filter(a => a.status === 'authorized').length;

  const batches = [
    { id: 'B001', course: 'Strategic Leadership Development Programme', count: 3, status: 'authorized', startDate: '2026-04-15' },
    { id: 'B002', course: 'Education Policy Analysis', count: 2, status: 'pending', startDate: '2026-05-01' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">DD/CD&T Authorizer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorize training commencement and track batches</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Pending Authorization" value={pendingAuth} icon={Clock} variant="warning" />
          <StatsCard title="Authorized" value={authorized} icon={Stamp} variant="success" />
          <StatsCard title="Active Batches" value={batches.length} icon={ClipboardList} variant="primary" />
        </div>

        {/* Training Batches */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Training Batches</CardTitle>
            <CardDescription>Manage and authorize training commencement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batches.map(batch => (
                <div key={batch.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{batch.id}</span>
                      <Badge variant={batch.status === 'authorized' ? 'default' : 'secondary'} className={batch.status === 'authorized' ? 'bg-success/10 text-success border-success/20' : ''}>
                        {batch.status === 'authorized' ? 'Authorized' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{batch.course}</p>
                    <p className="text-xs text-muted-foreground">{batch.count} trainees • Starts {batch.startDate}</p>
                  </div>
                  {batch.status === 'pending' ? (
                    <Button size="sm" className="gradient-primary text-primary-foreground">
                      <PlayCircle className="h-3.5 w-3.5 mr-1" /> Authorize
                    </Button>
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approved Trainees */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Approved Trainees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                    <TableRow key={app.id}>
                      <TableCell className="text-sm font-medium text-foreground">{app.studentName}</TableCell>
                      <TableCell className="text-sm text-foreground">{app.courseTitle}</TableCell>
                      <TableCell><AppStatusBadge status={app.status} /></TableCell>
                      <TableCell className="text-right">
                        {app.status === 'approved' && (
                          <Button variant="ghost" size="sm" className="text-primary text-xs">
                            <Stamp className="h-3.5 w-3.5 mr-1" /> Authorize
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
