-- Allow admins to insert enrollments for any student
CREATE POLICY "Admins can create enrollments"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);