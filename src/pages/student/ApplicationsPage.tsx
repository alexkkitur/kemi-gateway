import { DashboardLayout } from '@/components/DashboardLayout';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockApplications } from '@/lib/mock-data';
import { Download, Upload, Eye } from 'lucide-react';

export default function ApplicationsPage() {
  const myApps = mockApplications.filter(a => a.studentId === '1' || true); // show all for demo

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track status and manage your training applications</p>
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Application History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApps.map(app => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.courseTitle}</p>
                          <p className="text-xs text-muted-foreground">{app.studentName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{app.createdAt}</TableCell>
                      <TableCell><AppStatusBadge status={app.status} /></TableCell>
                      <TableCell><PaymentStatusBadge status={app.paymentStatus} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {app.paymentStatus === 'pending' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary">
                              <Upload className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {app.admissionLetter && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-success">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
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
