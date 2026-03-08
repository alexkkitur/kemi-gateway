import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { mockApplications } from '@/lib/mock-data';
import { BadgeCheck, ClipboardList, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ApproverDashboard() {
  const [comment, setComment] = useState('');
  const enrolledApps = mockApplications.filter(a => a.status === 'enrolled' || a.status === 'approved');
  const pendingApproval = mockApplications.filter(a => a.status === 'enrolled').length;
  const approved = mockApplications.filter(a => a.status === 'approved' || a.status === 'authorized').length;

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
            <CardTitle className="font-heading text-lg">Enrollment Lists for Approval</CardTitle>
            <CardDescription>Review submitted enrollment lists from Admission Officer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledApps.map(app => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
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
                              <Button variant="ghost" size="sm" className="text-success text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive text-xs">
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
                  <Textarea placeholder="Add approval comments..." value={comment} onChange={e => setComment(e.target.value)} className="text-sm" rows={2} />
                  <Button size="sm" className="mt-2 gradient-primary text-primary-foreground">
                    Submit Decision
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
