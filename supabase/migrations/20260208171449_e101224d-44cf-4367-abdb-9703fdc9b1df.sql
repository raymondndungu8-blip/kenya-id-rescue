
-- Drop existing restrictive policies on found_ids
DROP POLICY IF EXISTS "Authenticated users can create their own reports" ON public.found_ids;
DROP POLICY IF EXISTS "Users can view own or verified reports" ON public.found_ids;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.found_ids;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.found_ids;

-- Create public-access policies for testing
CREATE POLICY "Anyone can insert found IDs"
ON public.found_ids FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view found IDs"
ON public.found_ids FOR SELECT
USING (true);

CREATE POLICY "Anyone can update found IDs"
ON public.found_ids FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete found IDs"
ON public.found_ids FOR DELETE
USING (true);

-- Drop existing restrictive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload ID photos" ON storage.objects;
DROP POLICY IF EXISTS "Owners and verified users can view ID photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

-- Create public-access storage policies for testing
CREATE POLICY "Anyone can upload ID photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'id-photos');

CREATE POLICY "Anyone can view ID photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'id-photos');

CREATE POLICY "Anyone can update ID photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'id-photos');

CREATE POLICY "Anyone can delete ID photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'id-photos');
