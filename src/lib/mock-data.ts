export type UserRole = 'student' | 'admission_officer' | 'dd_aec' | 'dd_cdt';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fee: number;
  startDate: string;
  capacity: number;
  enrolled: number;
  category: string;
}

export type ApplicationStatus = 'pending_verification' | 'enrolled' | 'approved' | 'rejected' | 'authorized';
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paymentProof?: string;
  admissionLetter?: string;
}

export interface Approval {
  id: string;
  applicationId: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  timestamp: string;
}

export const mockUsers: User[] = [
  { id: '1', name: 'John Kamau', email: 'john@student.ke', role: 'student' },
  { id: '2', name: 'Mary Wanjiku', email: 'mary@kemi.go.ke', role: 'admission_officer' },
  { id: '3', name: 'Dr. Peter Ochieng', email: 'peter@kemi.go.ke', role: 'dd_aec' },
  { id: '4', name: 'Prof. Sarah Muthoni', email: 'sarah@kemi.go.ke', role: 'dd_cdt' },
];

export const mockCourses: Course[] = [
  { id: 'c1', title: 'Strategic Leadership Development Programme', description: 'A comprehensive programme designed to equip education managers with strategic leadership competencies for effective institutional management.', duration: '4 weeks', fee: 45000, startDate: '2026-04-15', capacity: 40, enrolled: 28, category: 'Leadership' },
  { id: 'c2', title: 'Education Policy Analysis & Implementation', description: 'Training on education policy development, analysis, and effective implementation strategies in the Kenyan education sector.', duration: '3 weeks', fee: 35000, startDate: '2026-05-01', capacity: 35, enrolled: 20, category: 'Policy' },
  { id: 'c3', title: 'Financial Management for Education Institutions', description: 'Practical training on budgeting, financial planning, procurement, and audit compliance for school administrators.', duration: '2 weeks', fee: 28000, startDate: '2026-04-20', capacity: 50, enrolled: 42, category: 'Finance' },
  { id: 'c4', title: 'ICT Integration in Education Management', description: 'Hands-on training on leveraging technology for school management, digital record keeping, and e-learning facilitation.', duration: '2 weeks', fee: 30000, startDate: '2026-05-10', capacity: 30, enrolled: 15, category: 'Technology' },
  { id: 'c5', title: 'Curriculum Development & Assessment', description: 'Training on competency-based curriculum design, learner assessment strategies, and quality assurance in education.', duration: '3 weeks', fee: 38000, startDate: '2026-06-01', capacity: 45, enrolled: 10, category: 'Curriculum' },
  { id: 'c6', title: 'Human Resource Management in Education', description: 'Comprehensive training on staff management, performance appraisal, conflict resolution, and labour relations.', duration: '2 weeks', fee: 25000, startDate: '2026-05-15', capacity: 40, enrolled: 32, category: 'HR' },
];

export const mockApplications: Application[] = [
  { id: 'a1', studentId: '1', studentName: 'John Kamau', studentEmail: 'john@student.ke', courseId: 'c1', courseTitle: 'Strategic Leadership Development Programme', status: 'approved', paymentStatus: 'verified', createdAt: '2026-03-01', admissionLetter: '/admission-letter.pdf' },
  { id: 'a2', studentId: '5', studentName: 'Grace Akinyi', studentEmail: 'grace@student.ke', courseId: 'c2', courseTitle: 'Education Policy Analysis & Implementation', status: 'enrolled', paymentStatus: 'verified', createdAt: '2026-03-02' },
  { id: 'a3', studentId: '6', studentName: 'David Mwangi', studentEmail: 'david@student.ke', courseId: 'c1', courseTitle: 'Strategic Leadership Development Programme', status: 'pending_verification', paymentStatus: 'submitted', createdAt: '2026-03-03', paymentProof: 'receipt.pdf' },
  { id: 'a4', studentId: '7', studentName: 'Faith Njeri', studentEmail: 'faith@student.ke', courseId: 'c3', courseTitle: 'Financial Management for Education Institutions', status: 'pending_verification', paymentStatus: 'pending', createdAt: '2026-03-04' },
  { id: 'a5', studentId: '8', studentName: 'Brian Otieno', studentEmail: 'brian@student.ke', courseId: 'c4', courseTitle: 'ICT Integration in Education Management', status: 'approved', paymentStatus: 'verified', createdAt: '2026-02-28', admissionLetter: '/admission-letter.pdf' },
  { id: 'a6', studentId: '9', studentName: 'Alice Chebet', studentEmail: 'alice@student.ke', courseId: 'c5', courseTitle: 'Curriculum Development & Assessment', status: 'enrolled', paymentStatus: 'verified', createdAt: '2026-03-05' },
  { id: 'a7', studentId: '10', studentName: 'Samuel Kipchoge', studentEmail: 'samuel@student.ke', courseId: 'c6', courseTitle: 'Human Resource Management in Education', status: 'authorized', paymentStatus: 'verified', createdAt: '2026-02-25', admissionLetter: '/admission-letter.pdf' },
];

// Internal labels (admin-facing)
export const statusLabels: Record<ApplicationStatus, string> = {
  pending_verification: 'Pending Verification',
  enrolled: 'Enrolled',
  approved: 'Approved',
  rejected: 'Rejected',
  authorized: 'Authorized',
};

// Simplified labels (student-facing) — hides internal workflow details
export const studentStatusLabels: Record<ApplicationStatus, string> = {
  pending_verification: 'Under Review',
  enrolled: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  authorized: 'Approved',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  admission_officer: 'Admission Officer',
  dd_aec: 'DD/AEC Approver',
  dd_cdt: 'DD/CD&T Authorizer',
};
