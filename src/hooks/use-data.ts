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
      const studentIds = [...new Set(apps.map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

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

  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      student_id: studentId,
      application_id: applicationId,
      proof_file_url: urlData.publicUrl,
      status: 'submitted',
    });

  if (paymentError) return { error: paymentError };

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
    .update({ status: newStatus, verified_by: verifiedBy, verification_date: new Date().toISOString() })
    .eq('application_id', applicationId);

  await supabase
    .from('applications')
    .update({
      payment_status: newStatus,
      status: verified ? 'enrolled' : 'rejected',
    })
    .eq('id', applicationId);

  // Log audit
  await logAuditAction(verifiedBy, verified ? 'payment_verified' : 'payment_rejected', 'applications', applicationId);
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

  if (approved) {
    try {
      await supabase.functions.invoke('generate-admission-letter', {
        body: { application_id: applicationId },
      });
    } catch (e) {
      console.error('Failed to generate admission letter:', e);
    }
  }

  await logAuditAction(approverId, approved ? 'application_approved' : 'application_rejected', 'applications', applicationId, comment);
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

  await logAuditAction(authorizerId, 'training_authorized', 'applications', applicationId, comment);
}

// ── Mark training completed ──
export async function markTrainingCompleted(applicationId: string, adminId: string, studentId: string, courseId: string) {
  await supabase
    .from('applications')
    .update({ status: 'training_completed' })
    .eq('id', applicationId);

  await supabase.from('graduations').insert({
    student_id: studentId,
    course_id: courseId,
    application_id: applicationId,
    completion_status: 'training_completed',
  });

  await logAuditAction(adminId, 'training_completed', 'applications', applicationId);
}

// ── Mark graduated ──
export async function markGraduated(applicationId: string, adminId: string) {
  await supabase
    .from('applications')
    .update({ status: 'graduated' })
    .eq('id', applicationId);

  await supabase
    .from('graduations')
    .update({ completion_status: 'graduated', graduation_date: new Date().toISOString().split('T')[0] })
    .eq('application_id', applicationId);

  await logAuditAction(adminId, 'graduated', 'applications', applicationId);
}

// ── Issue certificate ──
export async function issueCertificate(applicationId: string, studentId: string, courseId: string, adminId: string) {
  const certNumber = `KEMI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data, error } = await supabase.from('certificates').insert({
    certificate_number: certNumber,
    student_id: studentId,
    course_id: courseId,
    application_id: applicationId,
    status: 'ready',
    issued_date: new Date().toISOString(),
  }).select().single();

  if (!error) {
    await logAuditAction(adminId, 'certificate_issued', 'certificates', data.id, `Certificate #${certNumber}`);
  }

  return { data, error };
}

// ── Revoke certificate ──
export async function revokeCertificate(certId: string, adminId: string, reason: string) {
  await supabase.from('certificates')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', certId);

  await logAuditAction(adminId, 'certificate_revoked', 'certificates', certId, reason);
}

// ── Graduations ──
export function useGraduations() {
  const [graduations, setGraduations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('graduations')
      .select('*, courses(title), applications(status)')
      .order('created_at', { ascending: false });

    if (data) {
      const studentIds = [...new Set(data.map((g: any) => g.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setGraduations(data.map((g: any) => ({
        ...g,
        course_title: g.courses?.title || '',
        student_name: profileMap.get(g.student_id)?.full_name || 'Unknown',
        student_email: profileMap.get(g.student_id)?.email || '',
      })));
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);
  return { graduations, loading, refetch };
}

// ── Certificates ──
export function useCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('certificates')
      .select('*, courses(title)')
      .order('created_at', { ascending: false });

    if (data) {
      const studentIds = [...new Set(data.map((c: any) => c.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setCertificates(data.map((c: any) => ({
        ...c,
        course_title: c.courses?.title || '',
        student_name: profileMap.get(c.student_id)?.full_name || 'Unknown',
        student_email: profileMap.get(c.student_id)?.email || '',
      })));
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);
  return { certificates, loading, refetch };
}

// ── My Certificates (student) ──
export function useMyCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('certificates')
      .select('*, courses(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCertificates((data || []).map((c: any) => ({
          ...c,
          course_title: c.courses?.title || '',
        })));
        setLoading(false);
      });
  }, [user]);

  return { certificates, loading };
}

// ── Audit Logs ──
export function useAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      const adminIds = [...new Set(data.map(l => l.admin_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', adminIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setLogs(data.map(l => ({
        ...l,
        admin_name: profileMap.get(l.admin_id)?.full_name || 'System',
      })));
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);
  return { logs, loading, refetch };
}

// ── Audit logging helper ──
export async function logAuditAction(adminId: string, actionType: string, targetTable: string, targetRecordId: string, reason?: string) {
  await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action_type: actionType,
    target_table: targetTable,
    target_record_id: targetRecordId,
    reason: reason || null,
  });
}

// ── Super Admin Override ──
export async function adminOverrideStatus(applicationId: string, newStatus: string, adminId: string, reason: string) {
  await supabase
    .from('applications')
    .update({ status: newStatus as any })
    .eq('id', applicationId);

  await logAuditAction(adminId, `override_status_to_${newStatus}`, 'applications', applicationId, reason);
}

export async function adminOverridePayment(applicationId: string, newStatus: string, adminId: string, reason: string) {
  await supabase
    .from('payments')
    .update({ status: newStatus as any, verified_by: adminId, verification_date: new Date().toISOString() })
    .eq('application_id', applicationId);

  await supabase
    .from('applications')
    .update({ payment_status: newStatus as any })
    .eq('id', applicationId);

  await logAuditAction(adminId, `override_payment_to_${newStatus}`, 'applications', applicationId, reason);
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
