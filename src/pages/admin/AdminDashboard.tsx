import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { mockApplications } from '@/lib/mock-data';
import { Users, CheckSquare, Clock, FileText, Search, CheckCircle2, XCircle, Eye, Send } from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const apps = mockApplications.filter(a =>
    a.studentName.toLowerCase().includes(search.toLowerCase()) ||
    a.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  const total = mockApplications.length;
  const pending = mockApplications.filter(a => a.status === 'pending_verification').length;
  const enrolled = mockApplications.filter(a => a.status === 'enrolled').length;
  const verified = mockApplications.filter(a => a.paymentStatus === 'verified').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Admission Officer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage applicants, verify payments, and process enrollments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Applicants" value={total} icon={Users} variant="primary" subtitle="All applications" />
          <StatsCard title="Pending Verification" value={pending} icon={Clock} variant="warning" subtitle="Awaiting review" />
          <StatsCard title="Enrolled" value={enrolled} icon={CheckSquare} variant="success" subtitle="Payment verified" />
          <StatsCard title="Payments Verified" value={verified} icon={FileText} subtitle="This period" />
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-lg">All Applicants</CardTitle>
                <CardDescription>Review, verify and manage applications</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9 w-60" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  <Send className="h-3.5 w-3.5 mr-1" /> Submit to DD/AEC
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {apps.map(app => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-[200px] truncate">{app.courseTitle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{app.createdAt}</TableCell>
                      <TableCell><AppStatusBadge status={app.status} /></TableCell>
                      <TableCell><PaymentStatusBadge status={app.paymentStatus} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Eye className="h-3.5 w-3.5" /></Button>
                          {app.paymentStatus === 'submitted' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-success"><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><XCircle className="h-3.5 w-3.5" /></Button>
                            </>
                          )}
                        </div>
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
