-- Fix PUBLIC_DATA_EXPOSURE: Restrict found_ids table to authenticated users only
DROP POLICY IF EXISTS "Found IDs are viewable by everyone" ON public.found_ids;

CREATE POLICY "Authenticated users can view found IDs"
ON public.found_ids
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix STORAGE_EXPOSURE: Restrict photo access to photo owners only
DROP POLICY IF EXISTS "Authenticated users can view ID photos" ON storage.objects;

CREATE POLICY "Users can view their own ID photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);