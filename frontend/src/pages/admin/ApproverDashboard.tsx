import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAllApplications, approveApplication } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { BadgeCheck, ClipboardList, CheckCircle2, XCircle, Clock, MessageSquare, ListChecks, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function ApproverDashboard() {
  const [comment, setComment] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { applications, loading, refetch } = useAllApplications();
  const { user } = useAuth();

  const enrolledApps = useMemo(() => applications.filter(a => a.status === 'enrolled' || a.status === 'approved'), [applications]);
  const pendingApps = useMemo(() => enrolledApps.filter(a => a.status === 'enrolled'), [enrolledApps]);
  const pendingApproval = pendingApps.length;
  const approved = applications.filter(a => a.status === 'approved' || a.status === 'authorized').length;

  const allPendingSelected = pendingApps.length > 0 && pendingApps.every(a => selectedIds.has(a.id));
  const somePendingSelected = pendingApps.some(a => selectedIds.has(a.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allPendingSelected ? new Set() : new Set(pendingApps.map(a => a.id)));
  };

  const handleBulkAction = async (action: 'approved' | 'rejected') => {
    if (!user || selectedIds.size === 0) return;
    toast.loading(`Processing ${selectedIds.size} applications...`);
    for (const id of selectedIds) {
      await approveApplication(id, user.id, action === 'approved', comment || undefined);
    }
    toast.dismiss();
    toast.success(`${selectedIds.size} application(s) ${action}`);
    setSelectedIds(new Set());
    setComment('');
    refetch();
  };

  const handleSingle = async (id: string, approve: boolean) => {
    if (!user) return;
    await approveApplication(id, user.id, approve, comment || undefined);
    toast.success(approve ? 'Application approved' : 'Application rejected');
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">DD/AEC Approver Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Review enrollment lists and approve for admission letter generation</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatsCard title="Pending Approval" value={pendingApproval} icon={Clock} variant="warning" />
          <StatsCard title="Approved" value={approved} icon={BadgeCheck} variant="success" />
          <StatsCard title="Total Reviewed" value={enrolledApps.length} icon={ClipboardList} variant="primary" />
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Enrollment Lists for Approval</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Review submitted enrollment lists from Admission Officer</CardDescription>
              </div>
              {pendingApps.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedIds.size > 0 && <span className="text-xs text-muted-foreground font-medium">{selectedIds.size} selected</span>}
                  <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10 text-xs" disabled={selectedIds.size === 0} onClick={() => handleBulkAction('approved')}>
                    <ListChecks className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs" disabled={selectedIds.size === 0} onClick={() => handleBulkAction('rejected')}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="block sm:hidden space-y-3">
                  {enrolledApps.map(app => (
                    <div key={app.id} className={`p-3 rounded-lg border bg-card space-y-2 ${selectedIds.has(app.id) ? 'border-primary/40 bg-primary/5' : ''}`}>
                      <div className="flex items-start gap-2">
                        {app.status === 'enrolled' && (
                          <Checkbox checked={selectedIds.has(app.id)} onCheckedChange={() => toggleSelect(app.id)} className="mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                        </div>
                        <AppStatusBadge status={app.status} />
                      </div>
                      {app.status === 'enrolled' && (
                        <div className="flex gap-2 pl-6">
                          <Button size="sm" variant="outline" className="flex-1 text-xs text-success border-success/30" onClick={() => handleSingle(app.id, true)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive border-destructive/30" onClick={() => handleSingle(app.id, false)}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
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
                        <TableHead className="w-10">
                          {pendingApps.length > 0 && (
                            <Checkbox checked={allPendingSelected} onCheckedChange={toggleSelectAll} className={somePendingSelected && !allPendingSelected ? 'opacity-60' : ''} />
                          )}
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrolledApps.map(app => (
                        <TableRow key={app.id} className={`hover:bg-muted/30 ${selectedIds.has(app.id) ? 'bg-primary/5' : ''}`}>
                          <TableCell>
                            {app.status === 'enrolled' && <Checkbox checked={selectedIds.has(app.id)} onCheckedChange={() => toggleSelect(app.id)} />}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                            <p className="text-xs text-muted-foreground">{app.student_email}</p>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{app.course_title}</TableCell>
                          <TableCell><AppStatusBadge status={app.status} /></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {app.status === 'enrolled' && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-success text-xs" onClick={() => handleSingle(app.id, true)}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleSingle(app.id, false)}>
                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
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
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                    <div className="flex-1">
                      <Textarea placeholder="Add approval comments..." value={comment} onChange={e => setComment(e.target.value)} className="text-sm" rows={2} />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="gradient-primary text-primary-foreground text-xs" disabled={selectedIds.size === 0} onClick={() => handleBulkAction('approved')}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve {selectedIds.size > 0 ? `All ${selectedIds.size}` : 'Selected'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
