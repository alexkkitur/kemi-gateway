import { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyApplications, uploadPaymentProof } from '@/hooks/use-data';
import { Download, FileText, Upload, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { applications, loading, refetch } = useMyApplications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const admissionLetters = applications.filter(a => a.admission_letter_url);
  const payableApps = applications.filter(a =>
    a.payment_status === 'not_submitted' || a.payment_status === 'pending' || a.payment_status === 'rejected'
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedAppId) return;
    setUploading(true);
    const { error } = await uploadPaymentProof(user.id, selectedAppId, file);
    setUploading(false);
    if (error) toast.error('Upload failed: ' + error.message);
    else { toast.success('Payment proof uploaded successfully!'); refetch(); }
    e.target.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Download admission letters and submit payment proofs</p>
        </div>

        {/* Upload Payment Proof */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Upload Payment Proof</CardTitle>
            <CardDescription>Select an application and upload your bank slip or MPESA screenshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : payableApps.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/40">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No applications require payment at this time.
              </div>
            ) : (
              <>
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application…" />
                  </SelectTrigger>
                  <SelectContent>
                    {payableApps.map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.course_title}
                        {app.payment_status === 'rejected' && ' (rejected — resubmit)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleUpload}
                />

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${selectedAppId ? 'border-primary/40 hover:border-primary/70 hover:bg-primary/5' : 'border-border opacity-50 cursor-not-allowed'}`}
                  onClick={() => selectedAppId && fileInputRef.current?.click()}
                >
                  {uploading
                    ? <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
                    : <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  }
                  <p className="text-sm font-medium text-foreground">
                    {uploading ? 'Uploading…' : selectedAppId ? 'Click to upload payment proof' : 'Select an application first'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5 MB</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Admission Letters */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Admission Letters</CardTitle>
            <CardDescription>Download your approved admission letters</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : admissionLetters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No admission letters yet. They appear here once your application is approved.
              </div>
            ) : (
              <div className="space-y-2">
                {admissionLetters.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Admission Letter — {app.course_title}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs text-primary border-primary/30" asChild>
                      <a href={app.admission_letter_url!} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All applications — payment status reference */}
        {!loading && applications.length > 0 && (
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">Payment Status Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {applications.map(app => (
                  <div key={app.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <span className="text-foreground truncate max-w-[60%]">{app.course_title}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          app.payment_status === 'verified' ? 'default' :
                          app.payment_status === 'rejected' ? 'destructive' :
                          app.payment_status === 'submitted' ? 'secondary' : 'outline'
                        }
                        className="text-xs capitalize"
                      >
                        {app.payment_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
