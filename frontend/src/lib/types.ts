export type AppRole = 'student' | 'admission_officer' | 'dd_aec' | 'dd_cdt' | 'super_admin';

export type ApplicationStatus =
  | 'pending_verification' | 'enrolled' | 'approved'
  | 'authorized' | 'rejected' | 'training_completed' | 'graduated';

export type PaymentStatus = 'not_submitted' | 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Course {
  id: string;
  title: string;
  code: string | null;
  description: string | null;
  duration: string | null;
  level: string | null;
  category: string | null;
  capacity: number | null;
  enrolled_count?: number;
  fee: string | number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  course_id: string;
  course_title?: string;
  course_duration?: string;
  admission_letter_url?: string | null;
  status: ApplicationStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  id_number: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  // KEMI-specific
  tsc_number: string | null;
  delm_number: string | null;
  designation: string | null;
  employer: string | null;
  county: string | null;
  sub_county: string | null;
  school_name: string | null;
  profile_complete: boolean;
}

export interface FeeLineItem {
  fee_item_id?: string;
  name: string;
  category: string;
  amount: number;
  qty: number;
  line_total: number;
}

export interface FeeInvoice {
  id: string;
  application_id: string;
  student_id: string;
  line_items: FeeLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'partial' | 'paid' | 'waived';
  units_registered: number;
  has_transcript: boolean;
  has_exam_card: boolean;
  created_at: string;
  updated_at: string;
}

// Shim for backward compat
export type Tables<T extends string> =
  T extends 'courses' ? Course :
  T extends 'applications' ? Application :
  T extends 'profiles' ? Profile :
  T extends 'payments' ? Record<string, unknown> :
  T extends 'admission_letters' ? { application_id: string; file_url: string } :
  Record<string, unknown>;

export type Database = { public: { Enums: { app_role: AppRole } } };
