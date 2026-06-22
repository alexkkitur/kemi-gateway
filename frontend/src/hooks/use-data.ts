import { useEffect, useState } from 'react';
import { api, apiBaseUrl, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Course, Application, Profile, FeeInvoice } from '@/lib/types';

// ── Courses ──
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<Course[]>('/courses').then(setCourses).catch(() => setCourses([])).finally(() => setLoading(false));
  }, []);
  return { courses, loading };
}

// ── Applications ──
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
    try { setApplications(await api<ApplicationWithDetails[]>('/applications/me')); }
    finally { setLoading(false); }
  };

  useEffect(() => { refetch(); }, [user]);
  return { applications, loading, refetch };
}

export function useAllApplications() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    try { setApplications(await api<ApplicationWithDetails[]>('/applications')); }
    finally { setLoading(false); }
  };

  useEffect(() => { refetch(); }, []);
  return { applications, loading, refetch };
}

// ── Fee Invoice ──
export function useFeeInvoice(applicationId: string | null) {
  const [invoice, setInvoice] = useState<FeeInvoice | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!applicationId) return;
    setLoading(true);
    try { setInvoice(await api<FeeInvoice>(`/applications/${applicationId}/fee-invoice`)); }
    catch { setInvoice(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [applicationId]);
  return { invoice, loading, refetch: fetch, setInvoice };
}

export async function calculateFeeInvoice(
  applicationId: string,
  units_registered: number,
  has_transcript: boolean,
  has_exam_card: boolean
): Promise<{ data: FeeInvoice | null; error: string | null }> {
  try {
    const data = await api<FeeInvoice>(`/applications/${applicationId}/fee-invoice`, {
      method: 'POST',
      body: { units_registered, has_transcript, has_exam_card },
    });
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Failed' };
  }
}

// ── Apply for course ──
export async function applyForCourse(_studentId: string, courseId: string) {
  try {
    const data = await api<{ data: Application }>('/applications', { body: { course_id: courseId } });
    return { data: data.data, error: null as null | { message: string } };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : 'Failed' } };
  }
}

// ── Upload payment proof ──
export async function uploadPaymentProof(_studentId: string, applicationId: string, file: File, referenceNumber?: string) {
  const fd = new FormData();
  fd.append('file', file);
  if (referenceNumber) fd.append('reference_number', referenceNumber);
  try {
    await api(`/applications/${applicationId}/payment-proof`, { method: 'POST', formData: fd });
    return { error: null as null | { message: string } };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : 'Upload failed' } };
  }
}

// ── Admin actions ──
export async function verifyPayment(applicationId: string, verified: boolean, _verifiedBy: string, reason?: string) {
  await api(`/applications/${applicationId}/verify-payment`, { body: { verified, reason } });
}
export async function approveApplication(applicationId: string, _approverId: string, approved: boolean, comment?: string) {
  await api(`/applications/${applicationId}/approve`, { body: { approved, comment } });
}
export async function authorizeTraining(applicationId: string, _authorizerId: string, comment?: string) {
  await api(`/applications/${applicationId}/authorize`, { body: { comment } });
}
export async function markTrainingCompleted(applicationId: string, _adminId: string, _studentId: string, _courseId: string) {
  await api(`/applications/${applicationId}/complete-training`, { method: 'POST' });
}
export async function markGraduated(applicationId: string, _adminId: string) {
  await api(`/applications/${applicationId}/graduate`, { method: 'POST' });
}

// ── Certificates ──
export async function issueCertificate(applicationId: string, studentId: string, courseId: string, _adminId: string) {
  try {
    const data = await api<{ data: any }>('/certificates', {
      body: { application_id: applicationId, student_id: studentId, course_id: courseId },
    });
    return { data: data.data, error: null as null | { message: string } };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : 'Failed' } };
  }
}
export async function revokeCertificate(certId: string, _adminId: string, reason: string) {
  await api(`/certificates/${certId}/revoke`, { body: { reason } });
}

export function useGraduations() {
  const [graduations, setGraduations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    setLoading(true);
    try { setGraduations(await api<any[]>('/graduations')); }
    finally { setLoading(false); }
  };
  useEffect(() => { refetch(); }, []);
  return { graduations, loading, refetch };
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    setLoading(true);
    try { setCertificates(await api<any[]>('/certificates')); }
    finally { setLoading(false); }
  };
  useEffect(() => { refetch(); }, []);
  return { certificates, loading, refetch };
}

export function useMyCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    api<any[]>('/certificates/me').then(setCertificates).catch(() => setCertificates([])).finally(() => setLoading(false));
  }, [user]);
  return { certificates, loading };
}

// ── Audit Logs ──
export function useAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    setLoading(true);
    try { setLogs(await api<any[]>('/audit-logs')); }
    finally { setLoading(false); }
  };
  useEffect(() => { refetch(); }, []);
  return { logs, loading, refetch };
}
export async function logAuditAction() { /* server-side */ }

// ── Super Admin overrides ──
export async function adminOverrideStatus(applicationId: string, newStatus: string, _adminId: string, reason: string) {
  await api(`/applications/${applicationId}/override-status`, { body: { status: newStatus, reason } });
}
export async function adminOverridePayment(applicationId: string, newStatus: string, _adminId: string, reason: string) {
  await api(`/applications/${applicationId}/override-payment`, { body: { status: newStatus, reason } });
}

// ── Profile ──
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<Profile>('/profile/me').then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>): Promise<null | { message: string }> => {
    try {
      const updated = await api<Profile>('/profile/me', { method: 'PATCH', body: updates });
      setProfile(updated);
      return null;
    } catch (e) {
      return { message: e instanceof Error ? e.message : 'Failed' };
    }
  };

  return { profile, loading, updateProfile };
}

// ── Authenticated file download ──
export async function downloadAuthedFile(path: string, filename: string) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
