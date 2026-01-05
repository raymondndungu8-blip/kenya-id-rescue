-- Make the id-photos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'id-photos';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view ID photos" ON storage.objects;

-- Create policy for authenticated users to view ID photos
CREATE POLICY "Authenticated users can view ID photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-photos' 
  AND auth.uid() IS NOT NULL
);