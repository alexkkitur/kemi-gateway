import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Upload } from 'lucide-react';

const documents = [
  { id: 1, name: 'Admission Letter - Strategic Leadership', type: 'Admission Letter', date: '2026-03-05', downloadable: true },
  { id: 2, name: 'Payment Receipt - SLP', type: 'Receipt', date: '2026-03-01', downloadable: true },
  { id: 3, name: 'Training Schedule - April 2026', type: 'Schedule', date: '2026-03-06', downloadable: true },
];

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Download admission letters and upload payment proofs</p>
        </div>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Upload Payment Proof</CardTitle>
            <CardDescription>Submit proof of payment for pending applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">My Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                    </div>
                  </div>
                  {doc.downloadable && (
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
