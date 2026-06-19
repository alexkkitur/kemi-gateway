import { useEffect, useState } from 'react';
import { api, apiBaseUrl, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Course, Application, Profile } from '@/lib/types';

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
    try {
      const data = await api<ApplicationWithDetails[]>('/applications/me');
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, [user]);
  return { applications, loading, refetch };
}

export function useAllApplications() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await api<ApplicationWithDetails[]>('/applications');
      setApplications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, []);
  return { applications, loading, refetch };
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

// ── Admin: verify payment ──
export async function verifyPayment(applicationId: string, verified: boolean, _verifiedBy: string, reason?: string) {
  await api(`/applications/${applicationId}/verify-payment`, { body: { verified, reason } });
}

// ── Admin: approve/reject (DD/AEC) ──
export async function approveApplication(applicationId: string, _approverId: string, approved: boolean, comment?: string) {
  await api(`/applications/${applicationId}/approve`, { body: { approved, comment } });
}

// ── Admin: authorize (DD/CD&T) ──
export async function authorizeTraining(applicationId: string, _authorizerId: string, comment?: string) {
  await api(`/applications/${applicationId}/authorize`, { body: { comment } });
}

// ── Training lifecycle ──
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
    api<any[]>('/certificates/me')
      .then(setCertificates)
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
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

export async function logAuditAction() {
  /* no-op: audit logging is performed server-side on each admin action */
}

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
    api<Profile>('/profile/me')
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'id_number'>>) => {
    if (!user) return;
    try {
      const updated = await api<Profile>('/profile/me', { method: 'PATCH', body: updates });
      setProfile(updated);
      return null;
    } catch (e) {
      return e instanceof Error ? { message: e.message } : { message: 'Failed' };
    }
  };

  return { profile, loading, updateProfile };
}

// ── Helper for authenticated file downloads (admission letters / certificates) ──
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
