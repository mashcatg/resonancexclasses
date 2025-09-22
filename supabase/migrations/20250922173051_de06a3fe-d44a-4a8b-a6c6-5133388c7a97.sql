-- Fix difficulty level constraint by updating the courses table
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_difficulty_level_check;

-- Update quiz scoring system - remove passing_score, add new scoring fields
ALTER TABLE quizzes 
DROP COLUMN IF EXISTS passing_score,
ADD COLUMN points_per_question integer DEFAULT 1,
ADD COLUMN points_deducted_per_error integer DEFAULT 0,
ADD COLUMN total_questions integer DEFAULT 0;

-- Add content_items table to handle mixed lesson/quiz ordering
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('lesson', 'quiz')),
  item_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on content_items
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_items
CREATE POLICY "Course owners can manage content items" ON content_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    WHERE cm.id = content_items.module_id
    AND (c.instructor_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

CREATE POLICY "Anyone can view content items of accessible courses" ON content_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    WHERE cm.id = content_items.module_id
    AND (c.is_published = true OR c.instructor_id = auth.uid())
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();