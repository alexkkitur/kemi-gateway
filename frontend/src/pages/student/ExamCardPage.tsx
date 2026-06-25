import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useMyApplications } from '@/hooks/use-data';
import { api } from '@/lib/api';
import {
  ClipboardList, Plus, Trash2, Loader2, Download,
  CheckCircle2, Lock, AlertCircle, ChevronDown, Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface Unit { code: string; name: string; exam_date: string; }

interface ExamCard {
  id: string;
  card_number: string;
  units: Unit[];
  units_count: number;
  exam_series: string | null;
  exam_start_date: string | null;
  exam_end_date: string | null;
  status: 'pending' | 'issued' | 'cancelled';
  file_url: string | null;
  issued_at: string | null;
}

function AppExamCard({ app }: { app: any }) {
  const [card, setCard] = useState<ExamCard | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([{ code: '', name: '', exam_date: '' }]);
  const [examSeries, setExamSeries] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  const paymentVerified = app.payment_status === 'verified';
  const eligible = paymentVerified && !['pending_verification', 'rejected'].includes(app.status);

  useEffect(() => {
    if (!eligible) { setCard(null); return; }
    api<ExamCard | null>(`/applications/${app.id}/exam-card`)
      .then(c => {
        setCard(c);
        if (c) {
          setUnits(c.units?.length ? c.units : [{ code: '', name: '', exam_date: '' }]);
          setExamSeries(c.exam_series ?? '');
          setStartDate(c.exam_start_date ?? '');
          setEndDate(c.exam_end_date ?? '');
        }
      })
      .catch(() => setCard(null));
  }, [app.id, eligible]);

  const addUnit = () => setUnits(u => [...u, { code: '', name: '', exam_date: '' }]);
  const removeUnit = (i: number) => setUnits(u => u.filter((_, idx) => idx !== i));
  const changeUnit = (i: number, field: keyof Unit, v: string) =>
    setUnits(u => u.map((item, idx) => idx === i ? { ...item, [field]: v } : item));

  const handleSave = async () => {
    const valid = units.filter(u => u.code.trim() && u.name.trim());
    if (!valid.length) { toast.error('Add at least one unit with a code and name.'); return; }
    setSaving(true);
    try {
      const saved = await api<ExamCard>(`/applications/${app.id}/exam-card`, {
        method: 'POST',
        body: {
          units: valid,
          exam_series: examSeries || null,
          exam_start_date: startDate || null,
          exam_end_date: endDate || null,
        },
      });
      setCard(saved);
      setUnits(saved.units);
      toast.success(card ? 'Exam card request updated.' : 'Exam card request submitted. Awaiting admin approval.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const issued = card?.status === 'issued';
  const disabled = issued || saving;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Row header — always visible */}
      <button
        className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-muted/40 transition-colors disabled:cursor-not-allowed"
        onClick={() => eligible && setOpen(o => !o)}
        disabled={!eligible}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{app.course_title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {app.course_duration}&nbsp;·&nbsp;{new Date(app.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!eligible ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {!paymentVerified ? 'Awaiting payment verification' : 'Not eligible'}
            </span>
          ) : card === undefined ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : issued ? (
            <Badge variant="default" className="text-xs gap-1 bg-green-600">
              <CheckCircle2 className="h-3 w-3" /> Issued
            </Badge>
          ) : card?.status === 'pending' ? (
            <Badge variant="secondary" className="text-xs">Pending Approval</Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Not Requested</Badge>
          )}
          {eligible && (
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Expanded form */}
      {eligible && open && (
        <div className="border-t bg-muted/10 p-3 sm:p-4 space-y-4">

          {/* Issued — download banner */}
          {issued && card?.file_url && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-green-800 font-medium">
                  Exam card issued — {card.issued_at ? new Date(card.issued_at).toLocaleDateString() : ''}
                </span>
                <Button size="sm" className="text-xs bg-green-700 hover:bg-green-800 text-white gap-1" asChild>
                  <a href={card.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" /> Download Exam Card
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Pending notice */}
          {card?.status === 'pending' && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                Your request is pending admin review. You can still update your units below until the card is issued.
              </AlertDescription>
            </Alert>
          )}

          {/* Exam series / dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Exam Series</Label>
              <Input placeholder="e.g. April 2026" value={examSeries}
                onChange={e => setExamSeries(e.target.value)} disabled={disabled} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Exam Start Date</Label>
              <Input type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)} disabled={disabled} className="h-8 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Exam End Date</Label>
              <Input type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)} disabled={disabled} className="h-8 text-sm" />
            </div>
          </div>

          <Separator />

          {/* Units table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Units Registered
                <span className="ml-1.5 font-normal text-xs text-muted-foreground">
                  ({units.filter(u => u.code && u.name).length} unit{units.filter(u => u.code && u.name).length !== 1 ? 's' : ''})
                </span>
              </Label>
              {!disabled && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addUnit} type="button">
                  <Plus className="h-3 w-3" /> Add Unit
                </Button>
              )}
            </div>

            {/* Column headings */}
            <div className="grid grid-cols-[90px_1fr_140px_32px] gap-2">
              <span className="text-xs text-muted-foreground px-1">Unit Code</span>
              <span className="text-xs text-muted-foreground px-1">Unit Name</span>
              <span className="text-xs text-muted-foreground px-1">Exam Date</span>
              <span />
            </div>

            {units.map((unit, i) => (
              <div key={i} className="grid grid-cols-[90px_1fr_140px_32px] gap-2 items-center">
                <Input
                  placeholder="e.g. ECE301"
                  value={unit.code}
                  onChange={e => changeUnit(i, 'code', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-xs font-mono"
                />
                <Input
                  placeholder="Unit name"
                  value={unit.name}
                  onChange={e => changeUnit(i, 'name', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-xs"
                />
                <Input
                  type="date"
                  value={unit.exam_date}
                  onChange={e => changeUnit(i, 'exam_date', e.target.value)}
                  disabled={disabled}
                  className="h-8 text-xs"
                />
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => removeUnit(i)}
                  disabled={disabled || units.length === 1}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {!issued && (
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Save className="h-4 w-4 mr-2" />
              }
              {card ? 'Update Exam Card Request' : 'Submit Exam Card Request'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamCardPage() {
  const { applications, loading } = useMyApplications();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">

        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Exam Card
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register your units and request an exam card. Only available once your payment is verified.
          </p>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
          <AlertDescription className="text-sm space-y-1">
            <p><strong>Exam Card Fee: KSh 1,000</strong> — must be included in your payment before submitting.</p>
            <p className="text-muted-foreground">Add each unit you are sitting for, then submit your request. An admin will review and issue the PDF exam card.</p>
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="shadow-card border">
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No applications yet. Apply for a course first.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg">My Applications</CardTitle>
              <CardDescription>
                Click an application to register your exam units. Applications with unverified payment are locked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.map(app => (
                <AppExamCard key={app.id} app={app} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
