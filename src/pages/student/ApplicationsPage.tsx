import { DashboardLayout } from '@/components/DashboardLayout';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyApplications, uploadPaymentProof } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { applications, loading, refetch } = useMyApplications();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAppIdRef = useRef<string>('');

  const handleUploadClick = (appId: string) => {
    uploadAppIdRef.current = appId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    toast.loading('Uploading payment proof...');
    const { error } = await uploadPaymentProof(user.id, uploadAppIdRef.current, file);
    toast.dismiss();

    if (error) {
      toast.error('Upload failed: ' + (error as any).message);
    } else {
      toast.success('Payment proof uploaded successfully!');
      refetch();
    }
    e.target.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track status and manage your training applications</p>
        </div>

        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Application History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : applications.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No applications yet. Browse available courses to apply.</p>
            ) : (
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
                    {applications.map(app => (
                      <TableRow key={app.id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="text-sm font-medium text-foreground">{app.course_title}</p>
                          <p className="text-xs text-muted-foreground">{app.course_duration}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><AppStatusBadge status={app.status} studentFacing /></TableCell>
                        <TableCell><PaymentStatusBadge status={app.payment_status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {app.payment_status === 'pending' && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleUploadClick(app.id)}>
                                <Upload className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {app.admission_letter_url && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-success" asChild>
                                <a href={app.admission_letter_url} target="_blank" rel="noopener noreferrer"><Download className="h-3.5 w-3.5" /></a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
