import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCertificates, useAllApplications, issueCertificate, revokeCertificate } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Award, Search, Loader2, FileText, XCircle, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const { certificates, loading: certsLoading, refetch: refetchCerts } = useCertificates();
  const { applications, loading: appsLoading, refetch: refetchApps } = useAllApplications();
  const { user } = useAuth();

  const eligibleApps = useMemo(() =>
    applications.filter(a =>
      (a.status === 'training_completed' || a.status === 'graduated') &&
      !certificates.some(c => c.application_id === a.id)
    ), [applications, certificates]
  );

  const filteredCerts = certificates.filter(c =>
    (c.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.certificate_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const issued = certificates.filter(c => c.status === 'ready').length;
  const revoked = certificates.filter(c => c.status === 'revoked').length;
  const loading = certsLoading || appsLoading;

  const handleIssue = async (app: any) => {
    if (!user) return;
    const { error } = await issueCertificate(app.id, app.student_id, app.course_id, user.id);
    if (error) {
      toast.error('Failed to issue certificate');
    } else {
      toast.success('Certificate issued successfully');
      refetchCerts();
      refetchApps();
    }
  };

  const handleRevoke = async (certId: string) => {
    if (!user) return;
    await revokeCertificate(certId, user.id, 'Revoked by admin');
    toast.success('Certificate revoked');
    refetchCerts();
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Certificate Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Issue, manage and track training certificates</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatsCard title="Eligible" value={eligibleApps.length} icon={FileText} variant="warning" />
          <StatsCard title="Issued" value={issued} icon={Award} variant="success" />
          <StatsCard title="Revoked" value={revoked} icon={XCircle} variant="default" />
        </div>

        {/* Eligible for certificate issuance */}
        {eligibleApps.length > 0 && (
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base sm:text-lg">Pending Certificate Issuance</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Trainees eligible for certificate generation</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile */}
              <div className="block sm:hidden space-y-3">
                {eligibleApps.map(app => (
                  <div key={app.id} className="p-3 rounded-lg border bg-card space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.course_title}</p>
                    </div>
                    <Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground" onClick={() => handleIssue(app)}>
                      <Award className="h-3 w-3 mr-1" /> Issue Certificate
                    </Button>
                  </div>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleApps.map(app => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <p className="text-sm font-medium text-foreground">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground">{app.student_email}</p>
                        </TableCell>
                        <TableCell className="text-sm">{app.course_title}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => handleIssue(app)}>
                            <Award className="h-3.5 w-3.5 mr-1" /> Issue Certificate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issued certificates */}
        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Issued Certificates</CardTitle>
                <CardDescription className="text-xs sm:text-sm">All generated certificates</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-full sm:w-60" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filteredCerts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">No certificates issued yet.</p>
            ) : (
              <>
                {/* Mobile */}
                <div className="block sm:hidden space-y-3">
                  {filteredCerts.map(cert => (
                    <div key={cert.id} className="p-3 rounded-lg border bg-card space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{cert.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{cert.course_title}</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-1">{cert.certificate_number}</p>
                        </div>
                        <Badge variant="outline" className={cert.status === 'ready' ? 'bg-success/10 text-success border-success/20 text-xs' : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                          {cert.status === 'ready' ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      {cert.status === 'ready' && (
                        <Button size="sm" variant="outline" className="w-full text-xs text-destructive" onClick={() => handleRevoke(cert.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificate #</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCerts.map(cert => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-xs">{cert.certificate_number}</TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{cert.student_name}</p>
                            <p className="text-xs text-muted-foreground">{cert.student_email}</p>
                          </TableCell>
                          <TableCell className="text-sm">{cert.course_title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cert.status === 'ready' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                              {cert.status === 'ready' ? 'Active' : 'Revoked'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-right">
                            {cert.status === 'ready' && (
                              <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => handleRevoke(cert.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Revoke
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
