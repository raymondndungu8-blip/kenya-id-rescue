-- Fix storage policy to allow verified users to access ID photos
-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own ID photos" ON storage.objects;

-- Create new policy that allows both owners AND verified users to view photos
CREATE POLICY "Owners and verified users can view ID photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-photos' 
  AND (
    -- Owner can always view their own photos
    auth.uid()::text = (storage.foldername(name))[1]
    OR 
    -- Verified users can view photos for found_ids they have approved verification for
    EXISTS (
      SELECT 1 FROM public.found_ids f
      JOIN public.verification_requests vr ON vr.found_id_ref = f.id
      WHERE f.photo_url LIKE '%' || name || '%'
        AND vr.requester_id = auth.uid()
        AND vr.status = 'approved'
        AND vr.expires_at > now()
    )
  )
);