import { Badge } from '@/components/ui/badge';
import { ApplicationStatus, PaymentStatus, statusLabels, studentStatusLabels, paymentStatusLabels } from '@/lib/mock-data';

const statusStyles: Record<ApplicationStatus, string> = {
  pending_verification: 'bg-warning/10 text-warning border-warning/20',
  enrolled: 'bg-primary/10 text-primary border-primary/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  authorized: 'bg-success/10 text-success border-success/20',
  training_completed: 'bg-primary/10 text-primary border-primary/20',
  graduated: 'bg-success/10 text-success border-success/20',
};

const studentStatusStyles: Record<ApplicationStatus, string> = {
  pending_verification: 'bg-warning/10 text-warning border-warning/20',
  enrolled: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  authorized: 'bg-success/10 text-success border-success/20',
  training_completed: 'bg-primary/10 text-primary border-primary/20',
  graduated: 'bg-success/10 text-success border-success/20',
};

const paymentStyles: Record<PaymentStatus, string> = {
  pending: 'bg-muted text-muted-foreground border-border',
  submitted: 'bg-warning/10 text-warning border-warning/20',
  verified: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  studentFacing?: boolean;
}

export function AppStatusBadge({ status, studentFacing = false }: StatusBadgeProps) {
  const labels = studentFacing ? studentStatusLabels : statusLabels;
  const styles = studentFacing ? studentStatusStyles : statusStyles;
  return (
    <Badge variant="outline" className={`${styles[status]} font-medium text-xs`}>
      {labels[status]}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={`${paymentStyles[status]} font-medium text-xs`}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}
