import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Info, Bell } from 'lucide-react';

const notifications = [
  { id: 1, type: 'success', title: 'Application Approved', message: 'Your application for Strategic Leadership Development Programme has been approved. Download your admission letter.', time: '2 hours ago' },
  { id: 2, type: 'warning', title: 'Payment Pending', message: 'Please submit your proof of payment for the ICT Integration course.', time: '1 day ago' },
  { id: 3, type: 'info', title: 'New Course Available', message: 'Curriculum Development & Assessment programme is now open for registration.', time: '3 days ago' },
  { id: 4, type: 'success', title: 'Training Authorized', message: 'Training for Strategic Leadership batch has been authorized to commence on April 15, 2026.', time: '5 days ago' },
];

const iconMap = { success: CheckCircle2, warning: AlertCircle, info: Info };
const styleMap = { success: 'text-success bg-success/10', warning: 'text-warning bg-warning/10', info: 'text-primary bg-primary/10' };

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-heading font-bold text-foreground">Notifications</h1>
        </div>

        <div className="space-y-3">
          {notifications.map(n => {
            const Icon = iconMap[n.type as keyof typeof iconMap];
            return (
              <Card key={n.id} className="shadow-card border animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg shrink-0 h-fit ${styleMap[n.type as keyof typeof styleMap]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
