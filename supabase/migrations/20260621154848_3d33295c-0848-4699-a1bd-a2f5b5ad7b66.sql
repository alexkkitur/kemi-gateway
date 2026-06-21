-- Lock down SECURITY DEFINER helper functions and trigger functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Revoke anon SELECT from all public tables so the GraphQL/REST schema is not visible pre-login
REVOKE SELECT ON public.admission_letters FROM anon;
REVOKE SELECT ON public.applications FROM anon;
REVOKE SELECT ON public.approvals FROM anon;
REVOKE SELECT ON public.audit_logs FROM anon;
REVOKE SELECT ON public.certificates FROM anon;
REVOKE SELECT ON public.courses FROM anon;
REVOKE SELECT ON public.graduations FROM anon;
REVOKE SELECT ON public.payments FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;