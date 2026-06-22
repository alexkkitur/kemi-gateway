import { DashboardLayout } from '@/components/DashboardLayout';
import { AppStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FeeInvoiceCard from '@/components/FeeInvoiceCard';
import { useMyApplications, uploadPaymentProof } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Download, Upload, Loader2, ChevronDown, Receipt } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { applications, loading, refetch } = useMyApplications();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAppIdRef = useRef<string>('');
  const [openFee, setOpenFee] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadClick = (appId: string) => {
    uploadAppIdRef.current = appId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const { error } = await uploadPaymentProof(user.id, uploadAppIdRef.current, file);
    setUploading(false);
    if (error) toast.error('Upload failed: ' + error.message);
    else { toast.success('Payment proof uploaded!'); refetch(); }
    e.target.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track status, view fee invoices and upload payment proofs</p>
        </div>

        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base sm:text-lg">Application History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : applications.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No applications yet. Browse available courses to apply.
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="rounded-lg border bg-card overflow-hidden">

                    {/* Main row */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{app.course_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {app.course_duration} &nbsp;·&nbsp; Applied {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <AppStatusBadge status={app.status} studentFacing />
                        <PaymentStatusBadge status={app.payment_status} />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost" size="sm"
                          className={`text-xs gap-1 ${openFee === app.id ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => setOpenFee(openFee === app.id ? null : app.id)}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Fees</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${openFee === app.id ? 'rotate-180' : ''}`} />
                        </Button>

                        {(app.payment_status === 'not_submitted' || app.payment_status === 'pending' || app.payment_status === 'rejected') && (
                          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleUploadClick(app.id)} disabled={uploading}>
                            {uploading && uploadAppIdRef.current === app.id
                              ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              : <Upload className="h-3 w-3 mr-1" />
                            }
                            Pay
                          </Button>
                        )}

                        {app.admission_letter_url && (
                          <Button size="sm" variant="outline" className="text-xs h-8 text-green-700 border-green-200" asChild>
                            <a href={app.admission_letter_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" /> Letter
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Fee invoice panel */}
                    {openFee === app.id && (
                      <div className="border-t bg-muted/20 p-3 sm:p-4">
                        <FeeInvoiceCard applicationId={app.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
