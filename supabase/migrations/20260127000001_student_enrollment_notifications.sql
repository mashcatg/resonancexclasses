-- Allow students to insert notifications for admins when submitting enrollment requests
-- This policy allows any authenticated user to insert a notification

-- Drop existing insert policy
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

-- Create new policy that allows:
-- 1. Admins/superadmins to insert any notification
-- 2. Any authenticated user to insert notifications for admins (for enrollment requests)
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Create a function to notify admins when a new enrollment request is created
CREATE OR REPLACE FUNCTION notify_admins_on_enrollment_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  student_name TEXT;
  course_title TEXT;
BEGIN
  -- Only trigger for pending transactions (new enrollment requests)
  IF NEW.status = 'pending' THEN
    -- Get student name
    SELECT COALESCE(
      CONCAT(first_name, ' ', last_name),
      email,
      'A student'
    ) INTO student_name
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    -- Get course title
    SELECT title INTO course_title
    FROM public.courses
    WHERE id = NEW.course_id;
    
    -- Insert notification for each admin/superadmin
    FOR admin_record IN 
      SELECT user_id FROM public.profiles WHERE role IN ('admin', 'superadmin')
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        admin_record.user_id,
        'New Enrollment Request',
        CONCAT(student_name, ' has submitted an enrollment request for "', course_title, '" (TrxID: ', NEW.trx_id, ')'),
        'info',
        '/admin/enrollment-requests'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS on_enrollment_request_created ON public.transactions;
CREATE TRIGGER on_enrollment_request_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_enrollment_request();
