
-- Create graduations table
CREATE TABLE public.graduations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  application_id UUID NOT NULL REFERENCES public.applications(id),
  completion_status TEXT NOT NULL DEFAULT 'training_completed',
  graduation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  application_id UUID NOT NULL REFERENCES public.applications(id),
  file_url TEXT,
  qr_code_url TEXT,
  status TEXT NOT NULL DEFAULT 'not_ready',
  issued_date TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_record_id TEXT NOT NULL,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.graduations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Graduations RLS
CREATE POLICY "Students can view own graduations" ON public.graduations
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admin staff can view all graduations" ON public.graduations
FOR SELECT USING (
  has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_aec') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admin staff can manage graduations" ON public.graduations
FOR ALL USING (
  has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
);

-- Certificates RLS
CREATE POLICY "Students can view own certificates" ON public.certificates
FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admin staff can view all certificates" ON public.certificates
FOR SELECT USING (
  has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_aec') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admin staff can manage certificates" ON public.certificates
FOR ALL USING (
  has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
);

-- Audit Logs RLS
CREATE POLICY "Admin staff can view audit logs" ON public.audit_logs
FOR SELECT USING (
  has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_aec') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admin staff can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (
  auth.uid() = admin_id AND (
    has_role(auth.uid(), 'admission_officer') OR has_role(auth.uid(), 'dd_aec') OR has_role(auth.uid(), 'dd_cdt') OR has_role(auth.uid(), 'super_admin')
  )
);

-- Super admin policies
CREATE POLICY "Super admin can update applications" ON public.applications
FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can update payments" ON public.payments
FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can view all applications" ON public.applications
FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can view all payments" ON public.payments
FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can view all roles" ON public.user_roles
FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can manage admission letters" ON public.admission_letters
FOR ALL USING (has_role(auth.uid(), 'super_admin'));

INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;
