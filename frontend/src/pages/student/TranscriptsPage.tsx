import { useRef, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyApplications, uploadPaymentProof } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { ScrollText, Download, Upload, Loader2, FileCheck, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TRANSCRIPT_FEE = 'KSh 1,500';

function statusLabel(status: string) {
  switch (status) {
    case 'graduated':           return { label: 'Graduated',          color: 'default' };
    case 'training_completed':  return { label: 'Training Completed', color: 'secondary' };
    case 'authorized':          return { label: 'Authorized',         color: 'outline' };
    default:                    return { label: status.replace(/_/g, ' '), color: 'outline' };
  }
}

export default function TranscriptsPage() {
  const { user } = useAuth();
  const { applications, loading } = useMyApplications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // Applications eligible for transcript (completed or graduated)
  const eligible = applications.filter(a =>
    ['training_completed', 'graduated', 'authorized'].includes(a.status)
  );
  const inProgress = applications.filter(a =>
    ['pending_verification', 'enrolled', 'approved'].includes(a.status)
  );

  const handleRequestTranscript = (appId: string) => {
    uploading !== appId && fileInputRef.current?.setAttribute('data-app-id', appId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const appId = fileInputRef.current?.getAttribute('data-app-id') ?? '';
    if (!file || !user || !appId) return;
    setUploading(appId);
    // Transcript fee payment proof is uploaded just like regular payment proof
    const { error } = await uploadPaymentProof(user.id, appId, file, 'TRANSCRIPT_FEE');
    setUploading(null);
    if (error) toast.error('Upload failed: ' + error.message);
    else toast.success('Transcript fee proof submitted! Processing will begin shortly.');
    e.target.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Transcripts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request and download academic transcripts for completed training programmes
          </p>
        </div>

        {/* Fee notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-4 pb-4">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Transcript Fee: {TRANSCRIPT_FEE}</p>
              <p className="text-muted-foreground mt-0.5">
                Pay via MPESA Paybill or Bank Transfer and upload proof below. Transcripts are processed within 5–7 working days.
              </p>
            </div>
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

        {/* Eligible applications */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              Eligible for Transcript
            </CardTitle>
            <CardDescription>
              Programmes you have completed or been authorized for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : eligible.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ScrollText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No completed programmes yet.</p>
                <p className="text-xs mt-1">Transcripts become available after your training is completed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligible.map(app => {
                  const { label, color } = statusLabel(app.status);
                  const isUploading = uploading === app.id;
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{app.course_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {app.course_duration} &nbsp;·&nbsp; Applied {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                        <Badge variant={color as any} className="capitalize text-xs">{label}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 gap-1"
                          onClick={() => handleRequestTranscript(app.id)}
                          disabled={isUploading}
                        >
                          {isUploading
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Upload className="h-3 w-3" />
                          }
                          {isUploading ? 'Uploading…' : 'Submit Fee Proof'}
                        </Button>
                        {/* If transcript PDF is available via documents */}
                        {app.admission_letter_url && (
                          <Button size="sm" variant="outline" className="text-xs h-8 text-green-700 border-green-200 gap-1" asChild>
                            <a href={app.admission_letter_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3" /> Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-progress applications */}
        {!loading && inProgress.length > 0 && (
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                In Progress
              </CardTitle>
              <CardDescription>These will become eligible once training is completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inProgress.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
                    <span className="truncate text-foreground">{app.course_title}</span>
                    <Badge variant="secondary" className="text-xs capitalize shrink-0">
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
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
