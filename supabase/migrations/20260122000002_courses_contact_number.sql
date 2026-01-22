-- Add contact_number field to courses table for dynamic payment contact
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS contact_number TEXT DEFAULT '01950095883';

-- Add comment to explain the field
COMMENT ON COLUMN public.courses.contact_number IS 'bKash payment contact number shown to students during enrollment';
