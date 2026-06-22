import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, User, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import kemiLogo from '@/assets/kemi-logo.png';

const COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Uasin Gishu','Kiambu','Machakos',
  'Meru','Kakamega','Kilifi','Nyeri','Murang\'a','Kirinyaga','Nyandarua',
  'Laikipia','Samburu','Trans Nzoia','West Pokot','Elgeyo Marakwet','Nandi',
  'Baringo','Siaya','Kisii','Nyamira','Migori','Homa Bay','Vihiga','Bungoma',
  'Busia','Turkana','Marsabit','Isiolo','Tharaka Nithi','Embu','Kitui',
  'Makueni','Kajiado','Narok','Kericho','Bomet','Kwale','Taita Taveta',
  'Lamu','Tana River','Garissa','Wajir','Mandera','Mombasa',
].sort();

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Employment',    icon: Briefcase },
  { label: 'Location',      icon: MapPin },
];

export default function ProfileCompletionWizard() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tsc_number:  '',
    delm_number: '',
    phone:       '',
    id_number:   '',
    gender:      '',
    date_of_birth: '',
    designation:   '',
    employer:      '',
    school_name:   '',
    county:        '',
    sub_county:    '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const setSelect = (k: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.county) { toast.error('Please select your county'); return; }
    if (!form.tsc_number && !form.delm_number) {
      toast.error('Please provide your TSC No. or DELM No.'); return;
    }
    setSaving(true);
    try {
      await api('/profile/me', { method: 'PATCH', body: form });
      await refreshUser();
      toast.success('Profile completed!');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <img src={kemiLogo} alt="KEMI" className="h-14 mb-6 bg-white rounded-lg px-3 py-1 shadow" />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold border-2 transition-colors
              ${i < step ? 'bg-primary border-primary text-primary-foreground' :
                i === step ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-lg shadow-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-heading">{STEPS[step].label}</CardTitle>
          <CardDescription>
            {step === 0 && 'Your TSC/DELM number and personal details are required to access the portal.'}
            {step === 1 && 'Tell us about your current employment and school.'}
            {step === 2 && 'Provide your county and sub-county for placement purposes.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TSC Number <span className="text-muted-foreground text-xs">(if applicable)</span></Label>
                  <Input placeholder="TSC/0000/0000" value={form.tsc_number} onChange={set('tsc_number')} />
                </div>
                <div className="space-y-2">
                  <Label>DELM Number <span className="text-muted-foreground text-xs">(if applicable)</span></Label>
                  <Input placeholder="DELM/0000" value={form.delm_number} onChange={set('delm_number')} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">At least one of TSC or DELM number is required.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-destructive">*</span></Label>
                  <Input placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="space-y-2">
                  <Label>National ID <span className="text-destructive">*</span></Label>
                  <Input placeholder="12345678" value={form.id_number} onChange={set('id_number')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={setSelect('gender')}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Designation / Job Title <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Primary School Teacher" value={form.designation} onChange={set('designation')} />
              </div>
              <div className="space-y-2">
                <Label>Employer / Ministry</Label>
                <Input placeholder="e.g. Ministry of Education" value={form.employer} onChange={set('employer')} />
              </div>
              <div className="space-y-2">
                <Label>School / Institution Name</Label>
                <Input placeholder="e.g. Nairobi Primary School" value={form.school_name} onChange={set('school_name')} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>County <span className="text-destructive">*</span></Label>
                <Select value={form.county} onValueChange={setSelect('county')}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    {COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sub-County</Label>
                <Input placeholder="Enter sub-county" value={form.sub_county} onChange={set('sub_county')} />
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={back} disabled={step === 0}>Back</Button>
            {step < STEPS.length - 1
              ? <Button className="gradient-primary text-primary-foreground" onClick={next}>Next</Button>
              : (
                <Button className="gradient-primary text-primary-foreground" onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Complete Profile
                </Button>
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
