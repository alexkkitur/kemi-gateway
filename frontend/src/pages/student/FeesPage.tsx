import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import FeeInvoiceCard from '@/components/FeeInvoiceCard';
import { useMyApplications } from '@/hooks/use-data';
import { Receipt, ChevronDown, Loader2, CreditCard, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEE_SCHEDULE = [
  { name: 'Registration Fee',  amount: 2000,  note: 'Once per application' },
  { name: 'Unit Fee',          amount: 3000,  note: 'Per unit registered' },
  { name: 'Transcript Fee',    amount: 1500,  note: 'Per request' },
  { name: 'Exam Card Fee',     amount: 1000,  note: 'Per examination' },
];

export default function FeesPage() {
  const { applications, loading } = useMyApplications();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Fees &amp; Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, calculate and manage fee invoices for your training applications
          </p>
        </div>

        {/* Fee schedule reference */}
        <Card className="border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              KEMI Fee Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FEE_SCHEDULE.map(f => (
                <div key={f.name} className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-lg font-bold text-primary">
                    KSh {f.amount.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-foreground mt-0.5">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Course/Programme fees vary per programme. All fees are payable via MPESA Paybill or Bank Transfer.
            </p>
          </CardContent>
        </Card>

        {/* Per-application invoices */}
        <Card className="border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">My Fee Invoices</CardTitle>
                <CardDescription>Select an application to calculate or view its fee breakdown</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/student/documents')}>
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Upload Payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No applications yet.</p>
                <Button size="sm" className="mt-3 gradient-primary text-primary-foreground"
                  onClick={() => navigate('/student/courses')}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map(app => (
                  <div key={app.id} className="rounded-lg border overflow-hidden">
                    {/* Header row */}
                    <button
                      className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-muted/40 transition-colors"
                      onClick={() => toggle(app.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{app.course_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {app.course_duration} &nbsp;·&nbsp; {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            app.payment_status === 'verified' ? 'default' :
                            app.payment_status === 'rejected' ? 'destructive' :
                            app.payment_status === 'submitted' ? 'secondary' : 'outline'
                          }
                          className="text-xs capitalize"
                        >
                          {app.payment_status.replace(/_/g, ' ')}
                        </Badge>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === app.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded invoice */}
                    {open === app.id && (
                      <div className="border-t bg-muted/10 p-3 sm:p-4">
                        <FeeInvoiceCard applicationId={app.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment instructions */}
        <Card className="border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">MPESA Paybill</p>
                <p>Business No: <span className="font-mono font-medium text-foreground">123456</span></p>
                <p>Account No: <span className="font-mono font-medium text-foreground">Your ID Number</span></p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Bank Transfer</p>
                <p>Bank: <span className="font-medium text-foreground">Kenya Commercial Bank</span></p>
                <p>Account: <span className="font-mono font-medium text-foreground">1234567890</span></p>
              </div>
            </div>
            <Separator />
            <p className="text-xs">
              After payment, go to <strong>Documents</strong> or <strong>My Applications</strong> and upload your payment proof (MPESA screenshot or bank deposit slip). Processing takes 1–2 working days.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
