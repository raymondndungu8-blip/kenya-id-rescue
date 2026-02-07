
-- Add columns for front/back ID photos and AI-extracted data
ALTER TABLE public.found_ids
  ADD COLUMN IF NOT EXISTS photo_front_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_back_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_extracted_data JSONB;

-- Migrate existing photo_url data to photo_front_url
UPDATE public.found_ids 
SET photo_front_url = photo_url 
WHERE photo_url IS NOT NULL AND photo_front_url IS NULL;
