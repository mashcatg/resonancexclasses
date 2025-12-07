-- =========================================================
-- RESONANCEX CLASSES LMS - COMPLETE DATABASE SCHEMA
-- Run this in a new Supabase project's SQL Editor
-- =========================================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('superadmin', 'admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 2. COURSES TABLE
-- =====================
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  difficulty_level TEXT,
  duration_minutes INTEGER DEFAULT 0,
  what_you_learn JSONB DEFAULT '[]'::jsonb,
  featured_video_url TEXT,
  original_price NUMERIC(10,2),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  requirements JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 3. COURSE MODULES TABLE
-- =====================
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 4. LESSONS TABLE
-- =====================
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  pdf_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 5. ENROLLMENTS TABLE
-- =====================
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(student_id, course_id)
);

-- =====================
-- 6. COUPONS TABLE
-- =====================
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

-- =====================
-- 7. COURSE COUPONS TABLE
-- =====================
CREATE TABLE public.course_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, coupon_id)
);

-- =====================
-- 8. QUIZZES TABLE
-- =====================
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  attempts_allowed INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  points_per_question INTEGER DEFAULT 1,
  points_deducted_per_error INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 9. QUIZ QUESTIONS TABLE
-- =====================
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- 10. QUIZ ATTEMPTS TABLE
-- =====================
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

-- =====================
-- 11. CONTENT ITEMS TABLE (for mixed lesson/quiz ordering)
-- =====================
CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('lesson', 'quiz')),
  item_id UUID NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- 12. TRANSACTIONS TABLE
-- =====================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id),
  payment_id TEXT,
  trx_id TEXT,
  merchant_invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'bkash',
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  bkash_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 13. LESSON PROGRESS TABLE
-- =====================
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- =====================
-- 14. NOTIFICATIONS TABLE
-- =====================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 15. DEVICE SESSIONS TABLE
-- =====================
CREATE TABLE public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  UNIQUE(user_id, device_fingerprint)
);

-- =========================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS POLICIES FOR PROFILES
-- =========================================================
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- RLS POLICIES FOR COURSES
-- =========================================================
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR auth.uid() = instructor_id);
CREATE POLICY "Instructors can manage their courses" ON public.courses FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- =========================================================
-- RLS POLICIES FOR COURSE MODULES
-- =========================================================
CREATE POLICY "Anyone can view modules of accessible courses" ON public.course_modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND (is_published = true OR instructor_id = auth.uid())
  )
);
CREATE POLICY "Course owners can manage modules" ON public.course_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_id 
    AND (instructor_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

-- =========================================================
-- RLS POLICIES FOR LESSONS
-- =========================================================
CREATE POLICY "Anyone can view lessons of accessible courses" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.courses c ON c.id = cm.course_id
    WHERE cm.id = module_id 
    AND (c.is_published = true OR c.instructor_id = auth.uid())
  )
);
CREATE POLICY "Course owners can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.courses c ON c.id = cm.course_id
    WHERE cm.id = module_id 
    AND (c.instructor_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    ))
  )
);

-- =========================================================
-- RLS POLICIES FOR ENROLLMENTS
-- =========================================================
CREATE POLICY "Students can view their enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can enroll in courses" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their progress" ON public.enrollments FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);
CREATE POLICY "Admins can create enrollments" ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- =========================================================
-- RLS POLICIES FOR COUPONS
-- =========================================================
CREATE POLICY "Admins can manage all coupons" ON public.coupons FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'superadmin')
));
CREATE POLICY "Students can view active coupons" ON public.coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- =========================================================
-- RLS POLICIES FOR COURSE COUPONS
-- =========================================================
CREATE POLICY "Admins can manage course coupons" ON public.course_coupons FOR ALL USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'superadmin')
));
CREATE POLICY "Students can view course coupons" ON public.course_coupons FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.coupons c 
  WHERE c.id = coupon_id 
  AND c.is_active = true 
  AND (c.expires_at IS NULL OR c.expires_at > now())
));

-- =========================================================
-- RLS POLICIES FOR QUIZZES
-- =========================================================
CREATE POLICY "Anyone can view quizzes of accessible courses" ON public.quizzes FOR SELECT USING (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = course_id 
  AND (c.is_published = true OR c.instructor_id = auth.uid())
));
CREATE POLICY "Course owners can manage quizzes" ON public.quizzes FOR ALL USING (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = course_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- =========================================================
-- RLS POLICIES FOR QUIZ QUESTIONS
-- =========================================================
CREATE POLICY "Anyone can view questions of accessible quizzes" ON public.quiz_questions FOR SELECT USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.is_published = true OR c.instructor_id = auth.uid())
));
CREATE POLICY "Course owners can manage quiz questions" ON public.quiz_questions FOR ALL USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- =========================================================
-- RLS POLICIES FOR QUIZ ATTEMPTS
-- =========================================================
CREATE POLICY "Students can view their own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Instructors can view attempts for their courses" ON public.quiz_attempts FOR SELECT USING (EXISTS (
  SELECT 1 FROM quizzes q 
  JOIN courses c ON c.id = q.course_id 
  WHERE q.id = quiz_id 
  AND (c.instructor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  ))
));

-- =========================================================
-- RLS POLICIES FOR CONTENT ITEMS
-- =========================================================
CREATE POLICY "Course owners can manage content items" ON content_items FOR ALL USING (
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
CREATE POLICY "Anyone can view content items of accessible courses" ON content_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    WHERE cm.id = content_items.module_id
    AND (c.is_published = true OR c.instructor_id = auth.uid())
  )
);

-- =========================================================
-- RLS POLICIES FOR TRANSACTIONS
-- =========================================================
CREATE POLICY "Students can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);
CREATE POLICY "Admins can update transactions" ON transactions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- =========================================================
-- RLS POLICIES FOR LESSON PROGRESS
-- =========================================================
CREATE POLICY "Students can view their own progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all progress" ON public.lesson_progress FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role IN ('admin', 'superadmin')
));

-- =========================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- =========================================================
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role IN ('admin', 'superadmin')
));

-- =========================================================
-- RLS POLICIES FOR DEVICE SESSIONS
-- =========================================================
CREATE POLICY "Users can view their own device sessions" ON public.device_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own device sessions" ON public.device_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own device sessions" ON public.device_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all device sessions" ON public.device_sessions FOR SELECT USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role IN ('admin', 'superadmin')
));
CREATE POLICY "Admins can update all device sessions" ON public.device_sessions FOR UPDATE USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND profiles.role IN ('admin', 'superadmin')
));

-- =========================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_merchant_invoice ON transactions(merchant_invoice_number);

-- =========================================================
-- FUNCTIONS
-- =========================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'mashcatg@gmail.com' THEN 'superadmin'
      ELSE 'student'
    END
  );
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================

-- Create bucket for course banners
INSERT INTO storage.buckets (id, name, public) VALUES ('course-banners', 'course-banners', true);

-- Create bucket for course resources (PDFs, documents, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-resources', 'course-resources', true);

-- =========================================================
-- STORAGE POLICIES
-- =========================================================

-- Course banners policies
CREATE POLICY "Course banners are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'course-banners');
CREATE POLICY "Instructors can upload course banners" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);
CREATE POLICY "Instructors can update course banners" ON storage.objects FOR UPDATE USING (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);
CREATE POLICY "Instructors can delete course banners" ON storage.objects FOR DELETE USING (
  bucket_id = 'course-banners' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('instructor', 'admin', 'superadmin')
  )
);

-- Course resources policies
CREATE POLICY "Anyone can view course resources" ON storage.objects FOR SELECT USING (bucket_id = 'course-resources');
CREATE POLICY "Authenticated users can upload course resources" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated users can update their course resources" ON storage.objects FOR UPDATE USING (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);
CREATE POLICY "Authenticated users can delete their course resources" ON storage.objects FOR DELETE USING (
  bucket_id = 'course-resources' 
  AND auth.role() = 'authenticated'
);
