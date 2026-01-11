-- Create search_logs table for audit purposes
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  search_params JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own search logs (authenticated users only)
CREATE POLICY "Users can insert their own search logs"
ON public.search_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  found_id_ref UUID REFERENCES public.found_ids(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  verification_answer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  reporter_response TEXT
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Requesters can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.verification_requests FOR SELECT
USING (auth.uid() = requester_id);

-- Users can create verification requests
CREATE POLICY "Users can create verification requests"
ON public.verification_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Reporters can view requests for their IDs
CREATE POLICY "Reporters can view requests for their reports"
ON public.verification_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.found_ids fi
    WHERE fi.id = found_id_ref AND fi.reporter_id = auth.uid()
  )
);

-- Reporters can update requests for their reports (approve/reject)
CREATE POLICY "Reporters can update requests for their reports"
ON public.verification_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.found_ids fi
    WHERE fi.id = found_id_ref AND fi.reporter_id = auth.uid()
  )
);

-- Update found_ids SELECT policy to allow verified access
DROP POLICY IF EXISTS "Users can view their own reports" ON public.found_ids;

CREATE POLICY "Users can view own or verified reports"
ON public.found_ids FOR SELECT
USING (
  auth.uid() = reporter_id
  OR EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.found_id_ref = id
    AND vr.requester_id = auth.uid()
    AND vr.status = 'approved'
    AND vr.expires_at > now()
  )
);

-- Create secure search function that returns masked data
CREATE OR REPLACE FUNCTION public.search_found_ids(
  search_name TEXT DEFAULT NULL,
  search_id_number TEXT DEFAULT NULL,
  search_id_type TEXT DEFAULT NULL,
  search_location TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  id_type TEXT,
  name_on_id_masked TEXT,
  id_number_masked TEXT,
  location_found TEXT,
  date_found DATE
) 
SECURITY INVOKER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Require at least one search parameter
  IF search_name IS NULL AND search_id_number IS NULL AND search_id_type IS NULL AND search_location IS NULL THEN
    RAISE EXCEPTION 'At least one search parameter is required';
  END IF;

  -- Log search attempts for audit (only if user is authenticated)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO search_logs (user_id, search_params, created_at)
    VALUES (auth.uid(), jsonb_build_object(
      'name', search_name,
      'id_number', search_id_number,
      'id_type', search_id_type,
      'location', search_location
    ), now());
  END IF;

  RETURN QUERY
  SELECT 
    f.id,
    f.id_type,
    -- Mask name: show first 3 chars + ***
    CASE 
      WHEN f.name_on_id IS NOT NULL AND length(f.name_on_id) > 3
      THEN substring(f.name_on_id, 1, 3) || '***'
      WHEN f.name_on_id IS NOT NULL
      THEN '***'
      ELSE NULL
    END as name_on_id_masked,
    -- Mask ID number: show *** + last 4 chars
    CASE 
      WHEN f.id_number IS NOT NULL AND length(f.id_number) > 4
      THEN '***' || right(f.id_number, 4)
      WHEN f.id_number IS NOT NULL
      THEN '***'
      ELSE NULL
    END as id_number_masked,
    f.location_found,
    f.date_found::DATE
  FROM public.found_ids f
  WHERE 
    f.status = 'pending'
    AND (
      (search_name IS NOT NULL AND f.name_on_id ILIKE '%' || search_name || '%')
      OR (search_id_number IS NOT NULL AND f.id_number LIKE '%' || search_id_number || '%')
      OR (search_id_type IS NOT NULL AND f.id_type = search_id_type)
      OR (search_location IS NOT NULL AND f.location_found ILIKE '%' || search_location || '%')
    );
END;
$$;

-- Create function to request ID details (verification)
CREATE OR REPLACE FUNCTION public.request_id_details(
  found_id UUID,
  verification_answer TEXT
)
RETURNS UUID
SECURITY INVOKER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  verification_id UUID;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if the found_id exists and is pending
  IF NOT EXISTS (SELECT 1 FROM public.found_ids WHERE id = found_id AND status = 'pending') THEN
    RAISE EXCEPTION 'ID not found or not available';
  END IF;

  -- Check for existing pending request
  IF EXISTS (
    SELECT 1 FROM public.verification_requests 
    WHERE found_id_ref = found_id 
    AND requester_id = auth.uid() 
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending request for this ID';
  END IF;

  -- Create verification request
  INSERT INTO public.verification_requests (
    found_id_ref,
    requester_id,
    verification_answer,
    status
  ) VALUES (
    found_id,
    auth.uid(),
    verification_answer,
    'pending'
  ) RETURNING id INTO verification_id;
  
  RETURN verification_id;
END;
$$;