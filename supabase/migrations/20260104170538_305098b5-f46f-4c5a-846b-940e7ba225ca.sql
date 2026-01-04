-- Create table for reported found IDs
CREATE TABLE public.found_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  id_type TEXT NOT NULL,
  name_on_id TEXT,
  id_number TEXT,
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  photo_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.found_ids ENABLE ROW LEVEL SECURITY;

-- Anyone can view found IDs (public listing)
CREATE POLICY "Found IDs are viewable by everyone"
ON public.found_ids
FOR SELECT
USING (true);

-- Authenticated users can report found IDs
CREATE POLICY "Authenticated users can create found ID reports"
ON public.found_ids
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports"
ON public.found_ids
FOR UPDATE
USING (auth.uid() = reporter_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
ON public.found_ids
FOR DELETE
USING (auth.uid() = reporter_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_found_ids_updated_at
BEFORE UPDATE ON public.found_ids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for ID photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-photos', 'id-photos', true);

-- Storage policies for ID photos
CREATE POLICY "Anyone can view ID photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'id-photos');

CREATE POLICY "Authenticated users can upload ID photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'id-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'id-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'id-photos' AND auth.uid()::text = (storage.foldername(name))[1]);