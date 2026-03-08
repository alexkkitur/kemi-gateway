
-- Add new enum values first (these get committed automatically in separate migration)
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'training_completed';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'graduated';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
