-- Create hero_settings table for managing hero section content
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_heading TEXT NOT NULL DEFAULT 'Unlock Your Potential',
  sub_heading TEXT NOT NULL DEFAULT 'with',
  highlighted_text TEXT NOT NULL DEFAULT 'ResonanceX Classes.',
  description TEXT NOT NULL DEFAULT 'Join our expert-led courses designed to help you excel in your academic and professional journey.',
  button_text TEXT NOT NULL DEFAULT 'Explore Classes',
  hero_image_url TEXT NOT NULL DEFAULT 'https://img.freepik.com/free-photo/school-boy-with-book-park_23-2148199240.jpg?semt=ais_se_enriched&w=740&q=80',
  
  -- Stats configuration
  stat_1_value TEXT NOT NULL DEFAULT '8,000+',
  stat_1_label TEXT NOT NULL DEFAULT 'Active Students',
  stat_2_value TEXT NOT NULL DEFAULT '15+',
  stat_2_label TEXT NOT NULL DEFAULT 'Total Courses',
  stat_3_value TEXT NOT NULL DEFAULT '20+',
  stat_3_label TEXT NOT NULL DEFAULT 'Instructors',
  stat_4_value TEXT NOT NULL DEFAULT '24/7',
  stat_4_label TEXT NOT NULL DEFAULT 'Support',
  
  -- Community section
  community_badge TEXT NOT NULL DEFAULT '8k+',
  community_title TEXT NOT NULL DEFAULT 'Join our community',
  community_subtitle TEXT NOT NULL DEFAULT 'Start your journey today',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default values
INSERT INTO public.hero_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read hero settings
CREATE POLICY "Anyone can view hero settings"
  ON public.hero_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only superadmin can update hero settings
CREATE POLICY "Only superadmin can update hero settings"
  ON public.hero_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_settings_updated_at
  BEFORE UPDATE ON public.hero_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_settings_updated_at();
