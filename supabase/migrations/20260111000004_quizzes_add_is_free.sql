-- Add is_free column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.quizzes.is_free IS 'Indicates if the quiz is free and available to all users without enrollment';
