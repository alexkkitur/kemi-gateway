import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/use-data';
import { useAuth } from '@/lib/auth-context';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Uasin Gishu','Kiambu','Machakos',
  'Meru','Kakamega','Kilifi','Nyeri','Murang\'a','Kirinyaga','Nyandarua',
  'Laikipia','Samburu','Trans Nzoia','West Pokot','Elgeyo Marakwet','Nandi',
  'Baringo','Siaya','Kisii','Nyamira','Migori','Homa Bay','Vihiga','Bungoma',
  'Busia','Turkana','Marsabit','Isiolo','Tharaka Nithi','Embu','Kitui',
  'Makueni','Kajiado','Narok','Kericho','Bomet','Kwale','Taita Taveta',
  'Lamu','Tana River','Garissa','Wajir','Mandera',
].sort();

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: '', phone: '', id_number: '', gender: '',
    date_of_birth: '', address: '',
    tsc_number: '', delm_number: '',
    designation: '', employer: '', school_name: '',
    county: '', sub_county: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name:    profile.full_name || '',
        phone:        profile.phone || '',
        id_number:    profile.id_number || '',
        gender:       profile.gender || '',
        date_of_birth:profile.date_of_birth || '',
        address:      profile.address || '',
        tsc_number:   (profile as any).tsc_number || '',
        delm_number:  (profile as any).delm_number || '',
        designation:  (profile as any).designation || '',
        employer:     (profile as any).employer || '',
        school_name:  (profile as any).school_name || '',
        county:       (profile as any).county || '',
        sub_county:   (profile as any).sub_county || '',
      });
    }
  }, [profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const setSelect = (k: keyof typeof form) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const error = await updateProfile(form);
    if (!error) await refreshUser();
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  const isComplete = (profile as any)?.profile_complete || user?.profile_complete;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">My Profile</h1>
          {isComplete
            ? <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Complete</Badge>
            : <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Incomplete</Badge>
          }
        </div>

        {/* Identity */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identity</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={set('full_name')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>TSC Number</Label>
              <Input placeholder="TSC/0000/0000" value={form.tsc_number} onChange={set('tsc_number')} />
            </div>
            <div className="space-y-2">
              <Label>DELM Number</Label>
              <Input placeholder="DELM/0000" value={form.delm_number} onChange={set('delm_number')} />
            </div>
            <div className="space-y-2">
              <Label>National ID</Label>
              <Input placeholder="12345678" value={form.id_number} onChange={set('id_number')} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="+254 7XX XXX XXX" value={form.phone} onChange={set('phone')} />
            </div>
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
          </CardContent>
        </Card>

        {/* Employment */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Employment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Designation / Title</Label>
              <Input placeholder="e.g. Primary School Teacher" value={form.designation} onChange={set('designation')} />
            </div>
            <div className="space-y-2">
              <Label>Employer / Ministry</Label>
              <Input placeholder="e.g. Ministry of Education" value={form.employer} onChange={set('employer')} />
            </div>
            <div className="col-span-full space-y-2">
              <Label>School / Institution</Label>
              <Input placeholder="e.g. Nairobi Primary School" value={form.school_name} onChange={set('school_name')} />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>County</Label>
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
            <div className="col-span-full space-y-2">
              <Label>Address</Label>
              <Input placeholder="P.O. Box / Street Address" value={form.address} onChange={set('address')} />
            </div>
          </CardContent>
        </Card>

        <Button className="gradient-primary text-primary-foreground w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
}
