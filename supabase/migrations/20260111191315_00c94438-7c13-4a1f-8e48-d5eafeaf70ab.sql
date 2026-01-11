-- Drop the existing INSERT policy that doesn't enforce reporter_id
DROP POLICY IF EXISTS "Authenticated users can create found ID reports" ON public.found_ids;

-- Create a new policy that enforces reporter_id must match auth.uid()
CREATE POLICY "Authenticated users can create their own reports"
ON public.found_ids
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = reporter_id
);