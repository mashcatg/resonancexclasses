-- Add new fields to courses table
ALTER TABLE public.courses 
ADD COLUMN what_you_learn JSONB DEFAULT '[]'::jsonb,
ADD COLUMN featured_video_url TEXT,
ADD COLUMN original_price NUMERIC(10,2),
ADD COLUMN discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN requirements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN target_audience TEXT,
ADD COLUMN banner_url TEXT;

-- Update existing courses to have original_price = price for consistency
UPDATE public.courses SET original_price = price WHERE original_price IS NULL;

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create coupon policies
CREATE POLICY "Admins can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'superadmin')
));

CREATE POLICY "Students can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create course_coupons junction table
CREATE TABLE public.course_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, coupon_id)
);

-- Enable RLS on course_coupons
ALTER TABLE public.course_coupons ENABLE ROW LEVEL SECURITY;

-- Create course_coupons policies
CREATE POLICY "Admins can manage course coupons" 
ON public.course_coupons 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'superadmin')
));

CREATE POLICY "Students can view course coupons" 
ON public.course_coupons 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.coupons c 
  WHERE c.id = coupon_id 
  AND c.is_active = true 
  AND (c.expires_at IS NULL OR c.expires_at > now())
));

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  attempts_allowed INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create quiz policies
CREATE POLICY "Anyone can view quizzes of accessible courses" 
ON public.quizzes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = course_id 
  AND (c.is_published = true OR c.instructor_id = auth.uid())
));

CREATE POLICY "Course owners can manage quizzes" 
ON public.quizzes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = course_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB, -- For multiple choice options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create quiz_questions policies
CREATE POLICY "Anyone can view questions of accessible quizzes" 
ON public.quiz_questions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.is_published = true OR c.instructor_id = auth.uid())
));

CREATE POLICY "Course owners can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  max_score INTEGER,
  percentage NUMERIC(5,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_minutes INTEGER
);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create quiz_attempts policies
CREATE POLICY "Students can view their own attempts" 
ON public.quiz_attempts 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own attempts" 
ON public.quiz_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own attempts" 
ON public.quiz_attempts 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view attempts for their courses" 
ON public.quiz_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- Create storage bucket for course banners
INSERT INTO storage.buckets (id, name, public) VALUES ('course-banners', 'course-banners', true);

-- Create storage policies for course banners
CREATE POLICY "Course banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-banners');

CREATE POLICY "Instructors can upload course banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);

CREATE POLICY "Instructors can update course banners" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);

CREATE POLICY "Instructors can delete course banners" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();