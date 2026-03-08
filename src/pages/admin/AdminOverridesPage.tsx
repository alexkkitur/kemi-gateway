import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { useAllApplications, adminOverrideStatus, adminOverridePayment } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Wrench, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminOverridesPage() {
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [overrideType, setOverrideType] = useState<'status' | 'payment'>('status');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const { applications, loading, refetch } = useAllApplications();
  const { user } = useAuth();

  const filtered = applications.filter(a =>
    (a.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    a.course_title.toLowerCase().includes(search.toLowerCase())
  );

  const handleOverride = async () => {
    if (!user || !selectedApp || !newValue || !reason.trim()) {
      toast.error('Please fill in all fields including reason');
      return;
    }

    if (overrideType === 'status') {
      await adminOverrideStatus(selectedApp, newValue, user.id, reason);
    } else {
      await adminOverridePayment(selectedApp, newValue, user.id, reason);
    }

    toast.success('Override applied successfully');
    setSelectedApp(null);
    setNewValue('');
    setReason('');
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Admin Overrides</h1>
          <p className="text-sm text-muted-foreground mt-1">Manually override application and payment statuses</p>
        </div>

        <Card className="shadow-card border border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Override actions are permanent and audited</p>
                <p className="text-xs text-muted-foreground mt-0.5">All override actions are recorded in the audit log. A reason is required for every override.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedApp && (
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base sm:text-lg">Apply Override</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Overriding: {applications.find(a => a.id === selectedApp)?.student_name} — {applications.find(a => a.id === selectedApp)?.course_title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Override Type</label>
                  <Select value={overrideType} onValueChange={(v: 'status' | 'payment') => { setOverrideType(v); setNewValue(''); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Application Status</SelectItem>
                      <SelectItem value="payment">Payment Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Value</label>
                  <Select value={newValue} onValueChange={setNewValue}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {overrideType === 'status' ? (
                        <>
                          <SelectItem value="pending_verification">Pending Verification</SelectItem>
                          <SelectItem value="enrolled">Enrolled</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="authorized">Authorized</SelectItem>
                          <SelectItem value="training_completed">Training Completed</SelectItem>
                          <SelectItem value="graduated">Graduated</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Reason for Override *</label>
                <Textarea placeholder="Enter reason for this override..." value={reason} onChange={e => setReason(e.target.value)} rows={2} />
              </div>
              <div className="flex gap-2">
                <Button className="gradient-primary text-primary-foreground" onClick={handleOverride} disabled={!newValue || !reason.trim()}>
                  <Wrench className="h-4 w-4 mr-1" /> Apply Override
                </Button>
                <Button variant="outline" onClick={() => { setSelectedApp(null); setNewValue(''); setReason(''); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">All Applications</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Select an application to override</CardDescription>
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
                {/* Mobile */}
                <div className="block sm:hidden space-y-3">
                  {filtered.map(app => (
                    <div key={app.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <AppStatusBadge status={app.status} />
                        <PaymentStatusBadge status={app.payment_status} />
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setSelectedApp(app.id)}>
                        <Wrench className="h-3 w-3 mr-1" /> Override
                      </Button>
                    </div>
                  ))}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(app => (
                        <TableRow key={app.id} className={`hover:bg-muted/30 ${selectedApp === app.id ? 'bg-primary/5' : ''}`}>
                          <TableCell>
                            <p className="text-sm font-medium">{app.student_name}</p>
                            <p className="text-xs text-muted-foreground">{app.student_email}</p>
                          </TableCell>
                          <TableCell className="text-sm max-w-[180px] truncate">{app.course_title}</TableCell>
                          <TableCell><AppStatusBadge status={app.status} /></TableCell>
                          <TableCell><PaymentStatusBadge status={app.payment_status} /></TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => setSelectedApp(app.id)}>
                              <Wrench className="h-3.5 w-3.5 mr-1" /> Override
                            </Button>
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
