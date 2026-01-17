-- Fix 1: Add SELECT policy for search_logs so users can only view their own logs
CREATE POLICY "Users can view their own search logs"
ON public.search_logs FOR SELECT
USING (auth.uid() = user_id);

-- Fix 2: Add DELETE policy for search_logs so users can remove their own history
CREATE POLICY "Users can delete their own search logs"
ON public.search_logs FOR DELETE
USING (auth.uid() = user_id);

-- Fix 3: Add DELETE policy for verification_requests - requesters can delete their own requests
CREATE POLICY "Users can delete their own verification requests"
ON public.verification_requests FOR DELETE
USING (auth.uid() = requester_id);

-- Fix 4: Add DELETE policy for verification_requests - reporters can delete requests for their reports
CREATE POLICY "Reporters can delete requests for their reports"
ON public.verification_requests FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.found_ids fi
  WHERE fi.id = verification_requests.found_id_ref
  AND fi.reporter_id = auth.uid()
));