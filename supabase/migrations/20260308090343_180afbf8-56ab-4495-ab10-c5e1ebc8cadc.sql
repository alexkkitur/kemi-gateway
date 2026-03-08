-- Fix RLS policies to be PERMISSIVE (default should be permissive, but the existing ones were created as RESTRICTIVE)
-- Drop and recreate all policies as PERMISSIVE

-- user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt')
);

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin staff can view all profiles" ON public.profiles FOR SELECT USING (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt')
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- courses
DROP POLICY IF EXISTS "Anyone authenticated can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Admission officers can manage courses" ON public.courses;

CREATE POLICY "Anyone authenticated can view active courses" ON public.courses FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admission officers can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admission_officer'));

-- applications
DROP POLICY IF EXISTS "Students can view own applications" ON public.applications;
DROP POLICY IF EXISTS "Students can create applications" ON public.applications;
DROP POLICY IF EXISTS "Admin staff can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admission officers can update applications" ON public.applications;
DROP POLICY IF EXISTS "DD AEC can update applications" ON public.applications;
DROP POLICY IF EXISTS "DD CDT can update applications" ON public.applications;

CREATE POLICY "Students can view own applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin staff can view all applications" ON public.applications FOR SELECT USING (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt')
);
CREATE POLICY "Admission officers can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'admission_officer'));
CREATE POLICY "DD AEC can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'dd_aec'));
CREATE POLICY "DD CDT can update applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'dd_cdt'));

-- payments
DROP POLICY IF EXISTS "Students can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Students can submit payments" ON public.payments;
DROP POLICY IF EXISTS "Students can update own pending payments" ON public.payments;
DROP POLICY IF EXISTS "Admission officers can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admission officers can update payments" ON public.payments;

CREATE POLICY "Students can view own payments" ON public.payments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can submit payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own pending payments" ON public.payments FOR UPDATE USING (auth.uid() = student_id AND status = 'pending');
CREATE POLICY "Admission officers can view all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admission_officer'));
CREATE POLICY "Admission officers can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admission_officer'));

-- approvals
DROP POLICY IF EXISTS "Admin staff can view approvals" ON public.approvals;
DROP POLICY IF EXISTS "Approvers can insert approvals" ON public.approvals;

CREATE POLICY "Admin staff can view approvals" ON public.approvals FOR SELECT USING (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt')
);
CREATE POLICY "Approvers can insert approvals" ON public.approvals FOR INSERT WITH CHECK (
  auth.uid() = approver_id AND (public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt'))
);

-- admission_letters
DROP POLICY IF EXISTS "Students can view own admission letters" ON public.admission_letters;
DROP POLICY IF EXISTS "Admin staff can view all admission letters" ON public.admission_letters;
DROP POLICY IF EXISTS "Admins can generate admission letters" ON public.admission_letters;

CREATE POLICY "Students can view own admission letters" ON public.admission_letters FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = admission_letters.application_id AND applications.student_id = auth.uid())
);
CREATE POLICY "Admin staff can view all admission letters" ON public.admission_letters FOR SELECT USING (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec') OR public.has_role(auth.uid(), 'dd_cdt')
);
CREATE POLICY "Admins can generate admission letters" ON public.admission_letters FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admission_officer') OR public.has_role(auth.uid(), 'dd_aec')
);