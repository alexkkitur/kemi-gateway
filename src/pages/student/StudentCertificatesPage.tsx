import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMyCertificates } from '@/hooks/use-data';
import { Award, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentCertificatesPage() {
  const { certificates, loading } = useMyCertificates();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">My Certificates</h1>
          <p className="text-sm text-muted-foreground mt-1">View and download your training certificates</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : certificates.length === 0 ? (
          <Card className="shadow-card border">
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-base font-heading font-semibold text-foreground">No Certificates Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Certificates will appear here once your training is completed and processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map(cert => (
              <Card key={cert.id} className="shadow-card border hover:shadow-elevated transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className={cert.status === 'ready' ? 'bg-success/10 text-success border-success/20 text-xs' : cert.status === 'revoked' ? 'bg-destructive/10 text-destructive border-destructive/20 text-xs' : 'bg-muted text-muted-foreground text-xs'}>
                      {cert.status === 'ready' ? 'Ready' : cert.status === 'revoked' ? 'Revoked' : 'Not Ready'}
                    </Badge>
                  </div>
                  <CardTitle className="font-heading text-sm sm:text-base mt-2">{cert.course_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Certificate #</span>
                      <span className="font-mono text-foreground">{cert.certificate_number}</span>
                    </div>
                    {cert.issued_date && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="text-foreground">{new Date(cert.issued_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cert.status === 'ready' && cert.file_url && (
                      <Button size="sm" className="w-full mt-3 gradient-primary text-primary-foreground" asChild>
                        <a href={cert.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5 mr-1" /> Download Certificate
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
