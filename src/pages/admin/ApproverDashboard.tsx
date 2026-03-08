import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { mockApplications, Application } from '@/lib/mock-data';
import { BadgeCheck, ClipboardList, CheckCircle2, XCircle, Clock, MessageSquare, ListChecks } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function ApproverDashboard() {
  const [comment, setComment] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [apps, setApps] = useState<Application[]>(mockApplications);

  const enrolledApps = useMemo(() => apps.filter(a => a.status === 'enrolled' || a.status === 'approved'), [apps]);
  const pendingApps = useMemo(() => enrolledApps.filter(a => a.status === 'enrolled'), [enrolledApps]);
  const pendingApproval = pendingApps.length;
  const approved = apps.filter(a => a.status === 'approved' || a.status === 'authorized').length;

  const allPendingSelected = pendingApps.length > 0 && pendingApps.every(a => selectedIds.has(a.id));
  const somePendingSelected = pendingApps.some(a => selectedIds.has(a.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingApps.map(a => a.id)));
    }
  };

  const handleBulkAction = (action: 'approved' | 'rejected') => {
    if (selectedIds.size === 0) {
      toast.error('No applications selected');
      return;
    }

    setApps(prev => prev.map(app =>
      selectedIds.has(app.id) ? { ...app, status: action } : app
    ));

    const count = selectedIds.size;
    setSelectedIds(new Set());
    setComment('');

    toast.success(
      action === 'approved'
        ? `${count} application${count > 1 ? 's' : ''} approved — admission letters will be generated`
        : `${count} application${count > 1 ? 's' : ''} rejected`
    );
  };

  const handleSingleAction = (id: string, action: 'approved' | 'rejected') => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, status: action } : app
    ));
    toast.success(action === 'approved' ? 'Application approved' : 'Application rejected');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">DD/AEC Approver Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Review enrollment lists and approve for admission letter generation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Pending Approval" value={pendingApproval} icon={Clock} variant="warning" />
          <StatsCard title="Approved" value={approved} icon={BadgeCheck} variant="success" />
          <StatsCard title="Total Reviewed" value={enrolledApps.length} icon={ClipboardList} variant="primary" />
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-lg">Enrollment Lists for Approval</CardTitle>
                <CardDescription>Review submitted enrollment lists from Admission Officer</CardDescription>
              </div>
              {pendingApps.length > 0 && (
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedIds.size} selected
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success border-success/30 hover:bg-success/10"
                    disabled={selectedIds.size === 0}
                    onClick={() => handleBulkAction('approved')}
                  >
                    <ListChecks className="h-3.5 w-3.5 mr-1" /> Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={selectedIds.size === 0}
                    onClick={() => handleBulkAction('rejected')}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      {pendingApps.length > 0 && (
                        <Checkbox
                          checked={allPendingSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all pending"
                          className={somePendingSelected && !allPendingSelected ? 'opacity-60' : ''}
                        />
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
                    <TableRow
                      key={app.id}
                      className={`hover:bg-muted/30 ${selectedIds.has(app.id) ? 'bg-primary/5' : ''}`}
                    >
                      <TableCell>
                        {app.status === 'enrolled' && (
                          <Checkbox
                            checked={selectedIds.has(app.id)}
                            onCheckedChange={() => toggleSelect(app.id)}
                            aria-label={`Select ${app.studentName}`}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{app.studentName}</p>
                        <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{app.courseTitle}</TableCell>
                      <TableCell><AppStatusBadge status={app.status} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{app.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {app.status === 'enrolled' && (
                            <>
                              <Button variant="ghost" size="sm" className="text-success text-xs" onClick={() => handleSingleAction(app.id, 'approved')}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleSingleAction(app.id, 'rejected')}>
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
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-2" />
                <div className="flex-1">
                  <Textarea placeholder="Add approval comments for selected applications..." value={comment} onChange={e => setComment(e.target.value)} className="text-sm" rows={2} />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground"
                      disabled={selectedIds.size === 0}
                      onClick={() => handleBulkAction('approved')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Approve {selectedIds.size > 0 ? `All ${selectedIds.size}` : 'Selected'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={selectedIds.size === 0}
                      onClick={() => handleBulkAction('rejected')}
                    >
                      Reject Selected
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
