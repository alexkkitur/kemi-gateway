import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Tables } from '@/integrations/supabase/types';

type Course = Tables<'courses'>;
type Application = Tables<'applications'>;
type Payment = Tables<'payments'>;
type Profile = Tables<'profiles'>;
type AdmissionLetter = Tables<'admission_letters'>;

// ── Courses ──
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setCourses(data || []); setLoading(false); });
  }, []);

  return { courses, loading };
}

// ── Applications with joined course + profile data ──
export interface ApplicationWithDetails extends Application {
  course_title: string;
  course_duration: string;
  student_name?: string;
  student_email?: string;
  admission_letter_url?: string;
}

export function useMyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) return;
    setLoading(true);
    const { data: apps } = await supabase
      .from('applications')
      .select('*, courses(title, duration)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (apps) {
      // Fetch admission letters for these applications
      const appIds = apps.map(a => a.id);
      const { data: letters } = await supabase
        .from('admission_letters')
        .select('application_id, file_url')
        .in('application_id', appIds);

      const letterMap = new Map(letters?.map(l => [l.application_id, l.file_url]) || []);

      setApplications(apps.map(a => ({
        ...a,
        course_title: (a as any).courses?.title || '',
        course_duration: (a as any).courses?.duration || '',
        admission_letter_url: letterMap.get(a.id),
      })));
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, [user]);
  return { applications, loading, refetch };
}

// ── All applications (admin) ──
export function useAllApplications() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data: apps } = await supabase
      .from('applications')
      .select('*, courses(title, duration)')
      .order('created_at', { ascending: false });

    if (apps) {
      // Get student profiles
      const studentIds = [...new Set(apps.map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Get admission letters
      const appIds = apps.map(a => a.id);
      const { data: letters } = await supabase
        .from('admission_letters')
        .select('application_id, file_url')
        .in('application_id', appIds);

      const letterMap = new Map(letters?.map(l => [l.application_id, l.file_url]) || []);

      setApplications(apps.map(a => {
        const profile = profileMap.get(a.student_id);
        return {
          ...a,
          course_title: (a as any).courses?.title || '',
          course_duration: (a as any).courses?.duration || '',
          student_name: profile?.full_name || 'Unknown',
          student_email: profile?.email || '',
          admission_letter_url: letterMap.get(a.id),
        };
      }));
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);
  return { applications, loading, refetch };
}

// ── Apply for course ──
export async function applyForCourse(studentId: string, courseId: string) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single();
  return { data, error };
}

// ── Upload payment proof ──
export async function uploadPaymentProof(studentId: string, applicationId: string, file: File) {
  const path = `${studentId}/${applicationId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file);

  if (uploadError) return { error: uploadError };

  const { data: urlData } = supabase.storage
    .from('payment-proofs')
    .getPublicUrl(path);

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      student_id: studentId,
      application_id: applicationId,
      proof_file_url: urlData.publicUrl,
      status: 'submitted',
    });

  if (paymentError) return { error: paymentError };

  // Update application payment status
  await supabase
    .from('applications')
    .update({ payment_status: 'submitted' })
    .eq('id', applicationId);

  return { error: null };
}

// ── Admin: verify payment ──
export async function verifyPayment(applicationId: string, verified: boolean, verifiedBy: string) {
  const newStatus = verified ? 'verified' : 'rejected';

  await supabase
    .from('payments')
    .update({ status: newStatus, verified_by: verifiedBy })
    .eq('application_id', applicationId);

  await supabase
    .from('applications')
    .update({
      payment_status: newStatus,
      status: verified ? 'enrolled' : 'rejected',
    })
    .eq('id', applicationId);
}

// ── Admin: approve/reject (DD/AEC) ──
export async function approveApplication(applicationId: string, approverId: string, approved: boolean, comment?: string) {
  await supabase.from('approvals').insert({
    application_id: applicationId,
    approver_id: approverId,
    approver_role: 'dd_aec',
    status: approved ? 'approved' : 'rejected',
    comment: comment || null,
  });

  await supabase
    .from('applications')
    .update({ status: approved ? 'approved' : 'rejected' })
    .eq('id', applicationId);

  // Auto-generate admission letter on approval
  if (approved) {
    try {
      await supabase.functions.invoke('generate-admission-letter', {
        body: { application_id: applicationId },
      });
    } catch (e) {
      console.error('Failed to generate admission letter:', e);
    }
  }
}

// ── Admin: authorize (DD/CD&T) ──
export async function authorizeTraining(applicationId: string, authorizerId: string, comment?: string) {
  await supabase.from('approvals').insert({
    application_id: applicationId,
    approver_id: authorizerId,
    approver_role: 'dd_cdt',
    status: 'approved',
    comment: comment || null,
  });

  await supabase
    .from('applications')
    .update({ status: 'authorized' })
    .eq('id', applicationId);
}

// ── Profile ──
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'id_number'>>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : prev);
    }
    return error;
  };

  return { profile, loading, updateProfile };
}
