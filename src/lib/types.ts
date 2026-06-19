// Shared frontend types — mirrors Laravel API response shapes.

export type AppRole = 'student' | 'admin' | 'dd_aec' | 'dd_cdt' | 'super_admin';

export type ApplicationStatus =
  | 'pending_verification'
  | 'enrolled'
  | 'approved'
  | 'authorized'
  | 'rejected'
  | 'training_completed'
  | 'graduated';

export type PaymentStatus = 'not_submitted' | 'submitted' | 'verified' | 'rejected';

export interface Course {
  id: string;
  title: string;
  code: string | null;
  description: string | null;
  duration: string | null;
  level: string | null;
  category: string | null;
  capacity: number | null;
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
}

// Shim so existing imports `Tables<'profiles'>` etc. still type-check.
export type Tables<T extends string> =
  T extends 'courses' ? Course :
  T extends 'applications' ? Application :
  T extends 'profiles' ? Profile :
  T extends 'payments' ? Record<string, unknown> :
  T extends 'admission_letters' ? { application_id: string; file_url: string } :
  Record<string, unknown>;

export type Database = {
  public: {
    Enums: { app_role: AppRole };
  };
};
