-- Update the notification link to point to /admin/enrollments instead of /admin/enrollment-requests
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
        '/admin/enrollments'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
