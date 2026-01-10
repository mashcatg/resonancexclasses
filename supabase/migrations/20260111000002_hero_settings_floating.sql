-- Add floating badge fields to hero_settings
ALTER TABLE public.hero_settings
ADD COLUMN IF NOT EXISTS award_icon TEXT NOT NULL DEFAULT '🏆',
ADD COLUMN IF NOT EXISTS award_title TEXT NOT NULL DEFAULT 'World Best',
ADD COLUMN IF NOT EXISTS award_subtitle TEXT NOT NULL DEFAULT 'Top 10 popular',
ADD COLUMN IF NOT EXISTS flag_icon TEXT NOT NULL DEFAULT '🇬🇧',
ADD COLUMN IF NOT EXISTS flag_title TEXT NOT NULL DEFAULT 'English',
ADD COLUMN IF NOT EXISTS flag_subtitle TEXT NOT NULL DEFAULT '20 Popular Courses';

-- Backfill existing row with defaults (in case it exists without columns)
UPDATE public.hero_settings
SET
  award_icon = COALESCE(award_icon, '🏆'),
  award_title = COALESCE(award_title, 'World Best'),
  award_subtitle = COALESCE(award_subtitle, 'Top 10 popular'),
  flag_icon = COALESCE(flag_icon, '🇬🇧'),
  flag_title = COALESCE(flag_title, 'English'),
  flag_subtitle = COALESCE(flag_subtitle, '20 Popular Courses')
WHERE id IS NOT NULL;
