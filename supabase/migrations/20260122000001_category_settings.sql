-- Create category_settings table for managing category images from admin dashboard
CREATE TABLE IF NOT EXISTS public.category_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  badge_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default category values
INSERT INTO public.category_settings (category_name, image_url, badge_text, display_order) 
VALUES 
  ('SSC', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60', 'Popular', 1),
  ('HSC', 'https://images.pexels.com/photos/12903123/pexels-photo-12903123.jpeg', 'Top Rated', 2),
  ('Admission', 'https://images.pexels.com/photos/6150526/pexels-photo-6150526.jpeg', 'Trending', 3)
ON CONFLICT (category_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read category settings
CREATE POLICY "Anyone can view category settings"
  ON public.category_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only superadmin can update category settings
CREATE POLICY "Only superadmin can update category settings"
  ON public.category_settings
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

-- Policy: Only superadmin can insert category settings
CREATE POLICY "Only superadmin can insert category settings"
  ON public.category_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Policy: Only superadmin can delete category settings
CREATE POLICY "Only superadmin can delete category settings"
  ON public.category_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_category_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER category_settings_updated_at
  BEFORE UPDATE ON public.category_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_category_settings_updated_at();
