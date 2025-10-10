-- Create bucket for course resources (PDFs, documents, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-resources', 'course-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for course resources bucket
CREATE POLICY "Anyone can view course resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-resources');

CREATE POLICY "Authenticated users can upload course resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their course resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their course resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);