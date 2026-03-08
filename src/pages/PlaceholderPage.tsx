import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlaceholderPage({ title = 'Coming Soon' }: { title?: string }) {
  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{title}</h1>
        <Card className="shadow-card border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">This section is under development.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
