import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/hooks/use-data';
import { ScrollText, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';

const actionLabels: Record<string, { label: string; color: string }> = {
  payment_verified: { label: 'Payment Verified', color: 'bg-success/10 text-success border-success/20' },
  payment_rejected: { label: 'Payment Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  application_approved: { label: 'Application Approved', color: 'bg-success/10 text-success border-success/20' },
  application_rejected: { label: 'Application Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  training_authorized: { label: 'Training Authorized', color: 'bg-primary/10 text-primary border-primary/20' },
  training_completed: { label: 'Training Completed', color: 'bg-primary/10 text-primary border-primary/20' },
  graduated: { label: 'Graduated', color: 'bg-success/10 text-success border-success/20' },
  certificate_issued: { label: 'Certificate Issued', color: 'bg-success/10 text-success border-success/20' },
  certificate_revoked: { label: 'Certificate Revoked', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const { logs, loading } = useAuditLogs();

  const filtered = logs.filter(l =>
    (l.admin_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.action_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.reason || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all administrative actions and system changes</p>
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Activity Log</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{logs.length} total actions recorded</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-9 w-full sm:w-60" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <ScrollText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No audit logs yet.</p>
              </div>
            ) : (
              <>
                {/* Mobile */}
                <div className="block sm:hidden space-y-3">
                  {filtered.map(log => {
                    const actionInfo = actionLabels[log.action_type] || { label: log.action_type, color: 'bg-muted text-muted-foreground border-border' };
                    return (
                      <div key={log.id} className="p-3 rounded-lg border bg-card space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className={`${actionInfo.color} text-[10px] shrink-0`}>{actionInfo.label}</Badge>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-foreground"><span className="font-medium">{log.admin_name}</span></p>
                        {log.reason && <p className="text-xs text-muted-foreground">{log.reason}</p>}
                      </div>
                    );
                  })}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(log => {
                        const actionInfo = actionLabels[log.action_type] || { label: log.action_type, color: 'bg-muted text-muted-foreground border-border' };
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-sm font-medium">{log.admin_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${actionInfo.color} text-xs`}>{actionInfo.label}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{log.target_table}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.reason || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
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
