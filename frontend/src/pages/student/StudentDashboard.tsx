import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useMyApplications, useMyCertificates, useFeeInvoice } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import {
  BookOpen, FileText, Download, Clock, CheckCircle2, Loader2,
  Award, AlertCircle, Receipt, Upload, CreditCard, TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/** Mini fee summary for a single application — fetches its own invoice */
function AppFeeRow({ app }: { app: any }) {
  const { invoice, loading } = useFeeInvoice(app.id);
  const fmt = (n: number) => `KSh ${Number(n).toLocaleString('en-KE')}`;

  if (loading) return (
    <div className="flex justify-between text-xs text-muted-foreground py-1">
      <span className="truncate max-w-[160px]">{app.course_title}</span>
      <Loader2 className="h-3 w-3 animate-spin" />
    </div>
  );

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{app.course_title}</p>
        {invoice
          ? <p className="text-xs text-muted-foreground">{fmt(invoice.total)} • {invoice.units_registered} unit{invoice.units_registered !== 1 ? 's' : ''}</p>
          : <p className="text-xs text-muted-foreground italic">Fee not calculated yet</p>
        }
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {invoice && (
          <Badge
            variant={invoice.status === 'paid' ? 'default' : invoice.status === 'waived' ? 'outline' : 'secondary'}
            className="text-xs capitalize"
          >
            {invoice.status}
          </Badge>
        )}
        <PaymentStatusBadge status={app.payment_status} />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, loading: appsLoading } = useMyApplications();
  const { certificates } = useMyCertificates();

  const approvedCount   = applications.filter(a => ['approved','authorized','training_completed','graduated'].includes(a.status)).length;
  const pendingCount    = applications.filter(a => ['pending_verification','enrolled'].includes(a.status)).length;
  const awaitingPayment = applications.filter(a => a.payment_status === 'not_submitted' || a.payment_status === 'pending');
  const hasAdmissionLetters = applications.some(a => a.admission_letter_url);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.tsc_number ? `TSC: ${user.tsc_number}` : user?.delm_number ? `DELM: ${user.delm_number}` : 'KEMI Student Portal'}
          </p>
        </div>

        {/* Payment alerts */}
        {awaitingPayment.length > 0 && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm">
                <strong>{awaitingPayment.length}</strong> application{awaitingPayment.length > 1 ? 's' : ''} awaiting payment proof
              </span>
              <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={() => navigate('/student/applications')}>
                <Upload className="h-3 w-3 mr-1" /> Upload Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard title="Applications" value={applications.length} icon={FileText} variant="primary" />
          <StatsCard title="Approved"     value={approvedCount}        icon={CheckCircle2} variant="success" />
          <StatsCard title="Pending"      value={pendingCount}         icon={Clock} variant="warning" />
          <StatsCard title="Certificates" value={certificates.length}  icon={Award} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Applications + inline status */}
          <Card className="lg:col-span-2 shadow-card border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-base sm:text-lg">My Applications</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Application status &amp; payment tracking</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/student/applications')}>
                  View All
                </Button>
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
                <div className="space-y-2">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{app.course_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        <AppStatusBadge status={app.status} studentFacing />
                        <PaymentStatusBadge status={app.payment_status} />
                        {app.admission_letter_url && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" asChild>
                            <a href={app.admission_letter_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-4">

            {/* Fee Summary */}
            <Card className="shadow-card border">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Fee Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                ) : applications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No applications</p>
                ) : (
                  <div className="space-y-1 divide-y divide-border">
                    {applications.slice(0, 4).map(app => (
                      <AppFeeRow key={app.id} app={app} />
                    ))}
                  </div>
                )}
                {applications.length > 0 && (
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-2 text-primary"
                    onClick={() => navigate('/student/applications')}>
                    Manage fee invoices →
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card border">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gradient-primary text-primary-foreground text-sm h-9"
                  onClick={() => navigate('/student/courses')}>
                  <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
                </Button>
                {awaitingPayment.length > 0 && (
                  <Button variant="outline" className="w-full justify-start text-sm h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => navigate('/student/applications')}>
                    <CreditCard className="h-4 w-4 mr-2" /> Upload Payment
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start text-sm h-9"
                  onClick={() => navigate('/student/documents')}>
                  <Download className="h-4 w-4 mr-2" />
                  {hasAdmissionLetters ? 'Download Admission Letter' : 'My Documents'}
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9"
                  onClick={() => navigate('/student/certificates')}>
                  <Award className="h-4 w-4 mr-2" /> My Certificates
                </Button>
                <Separator />
                <Button variant="ghost" className="w-full justify-start text-sm h-9 text-muted-foreground"
                  onClick={() => navigate('/student/profile')}>
                  <TrendingUp className="h-4 w-4 mr-2" /> View My Profile
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
