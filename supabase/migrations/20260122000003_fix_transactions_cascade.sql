-- Fix transactions table foreign key to enable course deletion
-- Drop the existing constraint and add ON DELETE CASCADE

ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_course_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Also fix enrollment_id if needed
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_enrollment_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_enrollment_id_fkey 
FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE SET NULL;
