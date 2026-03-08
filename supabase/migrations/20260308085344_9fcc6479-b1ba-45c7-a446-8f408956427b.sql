-- ============================================
-- KEMI Training Portal Database Schema
-- ============================================

-- Roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'admission_officer', 'dd_aec', 'dd_cdt');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- User Roles table (separate from profiles)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec') OR
    public.has_role(auth.uid(), 'dd_cdt')
  );

-- ============================================
-- Profiles table
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  id_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin staff can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec') OR
    public.has_role(auth.uid(), 'dd_cdt')
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Courses table
-- ============================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  capacity INTEGER NOT NULL DEFAULT 30,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active courses" ON public.courses
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admission officers can manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admission_officer'));

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Applications table
-- ============================================
CREATE TYPE public.application_status AS ENUM (
  'pending_verification', 'enrolled', 'approved', 'rejected', 'authorized'
);
CREATE TYPE public.payment_status AS ENUM (
  'pending', 'submitted', 'verified', 'rejected'
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  status public.application_status NOT NULL DEFAULT 'pending_verification',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications" ON public.applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admin staff can view all applications" ON public.applications
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec') OR
    public.has_role(auth.uid(), 'dd_cdt')
  );

CREATE POLICY "Admission officers can update applications" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admission_officer'));

CREATE POLICY "DD AEC can update applications" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'dd_aec'));

CREATE POLICY "DD CDT can update applications" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'dd_cdt'));

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Payments table
-- ============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  proof_file_url TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can submit payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own pending payments" ON public.payments
  FOR UPDATE USING (auth.uid() = student_id AND status = 'pending');

CREATE POLICY "Admission officers can view all payments" ON public.payments
  FOR SELECT USING (public.has_role(auth.uid(), 'admission_officer'));

CREATE POLICY "Admission officers can update payments" ON public.payments
  FOR UPDATE USING (public.has_role(auth.uid(), 'admission_officer'));

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Approvals table (HIDDEN from students)
-- ============================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approver_role app_role NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Students CANNOT see approvals (internal process only!)
CREATE POLICY "Admin staff can view approvals" ON public.approvals
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec') OR
    public.has_role(auth.uid(), 'dd_cdt')
  );

CREATE POLICY "Approvers can insert approvals" ON public.approvals
  FOR INSERT WITH CHECK (
    auth.uid() = approver_id AND (
      public.has_role(auth.uid(), 'dd_aec') OR
      public.has_role(auth.uid(), 'dd_cdt')
    )
  );

-- ============================================
-- Admission Letters table
-- ============================================
CREATE TABLE public.admission_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admission_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own admission letters" ON public.admission_letters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = admission_letters.application_id
      AND applications.student_id = auth.uid()
    )
  );

CREATE POLICY "Admin staff can view all admission letters" ON public.admission_letters
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec') OR
    public.has_role(auth.uid(), 'dd_cdt')
  );

CREATE POLICY "Admins can generate admission letters" ON public.admission_letters
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admission_officer') OR
    public.has_role(auth.uid(), 'dd_aec')
  );

-- ============================================
-- Storage buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('admission-letters', 'admission-letters', false);

CREATE POLICY "Students can upload payment proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Students can view own payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admission officers can view all payment proofs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admission_officer')
  );

CREATE POLICY "Admins can upload admission letters" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'admission-letters' AND (
      public.has_role(auth.uid(), 'admission_officer') OR
      public.has_role(auth.uid(), 'dd_aec')
    )
  );

CREATE POLICY "Students can download own admission letters" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'admission-letters' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin staff can view all admission letters storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'admission-letters' AND (
      public.has_role(auth.uid(), 'admission_officer') OR
      public.has_role(auth.uid(), 'dd_aec') OR
      public.has_role(auth.uid(), 'dd_cdt')
    )
  );