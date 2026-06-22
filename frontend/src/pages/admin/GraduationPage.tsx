import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAllApplications, markTrainingCompleted, markGraduated } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, Clock, CheckCircle2, Users, Search, Loader2, Award } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function GraduationPage() {
  const [search, setSearch] = useState('');
  const { applications, loading, refetch } = useAllApplications();
  const { user } = useAuth();

  const authorizedApps = useMemo(() =>
    applications.filter(a => a.status === 'authorized' || a.status === 'training_completed' || a.status === 'graduated'),
    [applications]
  );

  const filtered = authorizedApps.filter(a =>
    (a.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    a.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const authorized = authorizedApps.filter(a => a.status === 'authorized').length;
  const completed = authorizedApps.filter(a => a.status === 'training_completed').length;
  const graduated = authorizedApps.filter(a => a.status === 'graduated').length;

  const handleMarkCompleted = async (app: any) => {
    if (!user) return;
    await markTrainingCompleted(app.id, user.id, app.student_id, app.course_id);
    toast.success('Training marked as completed');
    refetch();
  };

  const handleMarkGraduated = async (app: any) => {
    if (!user) return;
    await markGraduated(app.id, user.id);
    toast.success('Student marked as graduated');
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Graduation Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track training completion and manage graduation lists</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatsCard title="In Training" value={authorized} icon={Clock} variant="warning" />
          <StatsCard title="Completed" value={completed} icon={CheckCircle2} variant="primary" />
          <StatsCard title="Graduated" value={graduated} icon={GraduationCap} variant="success" />
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Trainee Progress</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage training completion and graduation</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-full sm:w-60" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No trainees found.</p>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden space-y-3">
                  {filtered.map(app => (
                    <div key={app.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                        </div>
                        <AppStatusBadge status={app.status} />
                      </div>
                      <div className="flex gap-2">
                        {app.status === 'authorized' && (
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleMarkCompleted(app)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                          </Button>
                        )}
                        {app.status === 'training_completed' && (
                          <Button size="sm" className="flex-1 text-xs gradient-primary text-primary-foreground" onClick={() => handleMarkGraduated(app)}>
                            <GraduationCap className="h-3 w-3 mr-1" /> Graduate
                          </Button>
                        )}
                        {app.status === 'graduated' && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                            <Award className="h-3 w-3 mr-1" /> Graduated
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table view */}
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
                      {filtered.map(app => (
                        <TableRow key={app.id} className="hover:bg-muted/30">
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                            <p className="text-xs text-muted-foreground">{app.student_email}</p>
                          </TableCell>
                          <TableCell className="text-sm text-foreground max-w-[200px] truncate">{app.course_title}</TableCell>
                          <TableCell><AppStatusBadge status={app.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {app.status === 'authorized' && (
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleMarkCompleted(app)}>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Completed
                                </Button>
                              )}
                              {app.status === 'training_completed' && (
                                <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => handleMarkGraduated(app)}>
                                  <GraduationCap className="h-3.5 w-3.5 mr-1" /> Graduate
                                </Button>
                              )}
                              {app.status === 'graduated' && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                  <Award className="h-3 w-3 mr-1" /> Graduated
                                </Badge>
                              )}
                            </div>
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
