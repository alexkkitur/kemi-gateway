import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useAllApplications, verifyPayment } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Users, CheckSquare, Clock, FileText, Search, CheckCircle2, XCircle, Loader2, GraduationCap, Award } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const { applications, loading, refetch } = useAllApplications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const filtered = applications.filter(a =>
    (a.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    a.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const total = applications.length;
  const pending = applications.filter(a => a.status === 'pending_verification').length;
  const enrolled = applications.filter(a => a.status === 'enrolled').length;
  const verified = applications.filter(a => a.payment_status === 'verified').length;

  const handleVerify = async (appId: string, approve: boolean) => {
    if (!user) return;
    await verifyPayment(appId, approve, user.id);
    toast.success(approve ? 'Payment verified' : 'Payment rejected');
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Admission Officer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage applicants, verify payments, and process enrollments</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard title="Total Applicants" value={total} icon={Users} variant="primary" />
          <StatsCard title="Pending Verification" value={pending} icon={Clock} variant="warning" />
          <StatsCard title="Enrolled" value={enrolled} icon={CheckSquare} variant="success" />
          <StatsCard title="Payments Verified" value={verified} icon={FileText} />
        </div>

        {/* Quick action cards for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => navigate('/admin/graduation')}>
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-xs">Graduation</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => navigate('/admin/certificates')}>
            <Award className="h-5 w-5 text-primary" />
            <span className="text-xs">Certificates</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => navigate('/admin/audit-logs')}>
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs">Audit Logs</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => navigate('/admin/payments')}>
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="text-xs">Payments</span>
          </Button>
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">All Applicants</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Review, verify and manage applications</CardDescription>
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
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden space-y-3">
                  {filtered.map(app => (
                    <div key={app.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.student_email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <AppStatusBadge status={app.status} />
                        <PaymentStatusBadge status={app.payment_status} />
                      </div>
                      {app.payment_status === 'submitted' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs text-success border-success/30" onClick={() => handleVerify(app.id, true)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive border-destructive/30" onClick={() => handleVerify(app.id, false)}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(app => (
                        <TableRow key={app.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                              <p className="text-xs text-muted-foreground">{app.student_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground max-w-[200px] truncate">{app.course_title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell><AppStatusBadge status={app.status} /></TableCell>
                          <TableCell><PaymentStatusBadge status={app.payment_status} /></TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {app.payment_status === 'submitted' && (
                                <>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleVerify(app.id, true)}>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleVerify(app.id, false)}>
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </>
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
