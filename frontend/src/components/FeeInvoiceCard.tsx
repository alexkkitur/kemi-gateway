import { useState } from 'react';
import { api } from '@/lib/api';
import { useFeeInvoice } from '@/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Receipt, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { FeeInvoice } from '@/lib/types';

interface Props {
  applicationId: string;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  partial: 'outline',
  paid:    'default',
  waived:  'outline',
};

const FEE_DEFAULTS = {
  registration: 2000,
  unit:         3000,
  transcript:   1500,
  exam_card:    1000,
};

export default function FeeInvoiceCard({ applicationId }: Props) {
  const { invoice: existing, loading: loadingExisting, setInvoice } = useFeeInvoice(applicationId);
  const [invoice, setLocalInvoice] = useState<FeeInvoice | null>(null);
  const [units, setUnits] = useState(1);
  const [transcript, setTranscript] = useState(false);
  const [examCard, setExamCard] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Use fetched invoice if we haven't recalculated locally
  const displayed = invoice ?? existing;

  // Sync controls from existing invoice when it loads
  const [synced, setSynced] = useState(false);
  if (existing && !synced) {
    setUnits(existing.units_registered || 1);
    setTranscript(existing.has_transcript);
    setExamCard(existing.has_exam_card);
    setSynced(true);
  }

  const calculate = async () => {
    setCalculating(true);
    try {
      const inv = await api<FeeInvoice>(`/applications/${applicationId}/fee-invoice`, {
        method: 'POST',
        body: { units_registered: units, has_transcript: transcript, has_exam_card: examCard },
      });
      setLocalInvoice(inv);
      setInvoice(inv);
      toast.success('Fee invoice updated');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to calculate fees');
    } finally {
      setCalculating(false);
    }
  };

  const fmt = (n: number | string) =>
    `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  // Preview total (before hitting calculate) based on defaults
  const previewTotal = FEE_DEFAULTS.registration
    + (units * FEE_DEFAULTS.unit)
    + (transcript ? FEE_DEFAULTS.transcript : 0)
    + (examCard ? FEE_DEFAULTS.exam_card : 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Fee Invoice
          {displayed && (
            <Badge variant={STATUS_VARIANT[displayed.status] ?? 'secondary'} className="ml-auto capitalize text-xs">
              {displayed.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/40 rounded-lg p-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Units Registered</Label>
            <Input
              type="number" min={0} max={20}
              value={units}
              onChange={e => setUnits(Math.max(0, Number(e.target.value)))}
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">× KSh 3,000 each</p>
          </div>
          <div className="flex flex-col gap-3 justify-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={transcript} onCheckedChange={v => setTranscript(!!v)} />
              <span>Transcript <span className="text-muted-foreground text-xs">(KSh 1,500)</span></span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={examCard} onCheckedChange={v => setExamCard(!!v)} />
              <span>Exam Card <span className="text-muted-foreground text-xs">(KSh 1,000)</span></span>
            </label>
          </div>
          <div className="flex flex-col justify-end gap-1">
            {!displayed && (
              <p className="text-xs text-muted-foreground">
                Estimated: <span className="font-semibold text-foreground">{fmt(previewTotal)}</span>
              </p>
            )}
            <Button size="sm" onClick={calculate} disabled={calculating} className="w-full">
              {calculating
                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              }
              {displayed ? 'Recalculate' : 'Calculate'}
            </Button>
          </div>
        </div>

        {/* Invoice breakdown */}
        {loadingExisting && !displayed && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {displayed && (
          <>
            <Separator />
            <div className="space-y-1.5">
              {displayed.line_items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name}
                    {item.qty > 1 && <span className="text-xs ml-1 text-muted-foreground/70">× {item.qty}</span>}
                  </span>
                  <span className="tabular-nums font-medium">{fmt(item.line_total)}</span>
                </div>
              ))}
            </div>
            <Separator />
            {displayed.discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>− {fmt(displayed.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total Payable</span>
              <span className="text-primary">{fmt(displayed.total)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
              Pay via <strong>MPESA Paybill</strong> or <strong>Bank Transfer</strong>, then upload your proof
              in the <em>Documents</em> section or via the Upload button on this application.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
