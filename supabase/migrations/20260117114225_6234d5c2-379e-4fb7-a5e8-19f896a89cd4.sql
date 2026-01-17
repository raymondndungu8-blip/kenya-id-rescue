-- Fix 1: Create helper function to escape LIKE pattern wildcards
CREATE OR REPLACE FUNCTION public.escape_like_pattern(input_text text) RETURNS text AS $$
BEGIN
  RETURN replace(replace(replace(input_text, '\', '\\'), '%', '\%'), '_', '\_');
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Fix 2: Drop and recreate search_found_ids with proper escaping and result limit
DROP FUNCTION IF EXISTS public.search_found_ids(text, text, text, text);

CREATE OR REPLACE FUNCTION public.search_found_ids(
  search_name text DEFAULT NULL,
  search_id_number text DEFAULT NULL,
  search_id_type text DEFAULT NULL,
  search_location text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  id_type text,
  name_on_id_masked text,
  id_number_masked text,
  location_found text,
  date_found date
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  escaped_name text;
  escaped_id_number text;
  escaped_location text;
BEGIN
  -- Escape LIKE wildcards to prevent injection
  escaped_name := escape_like_pattern(search_name);
  escaped_id_number := escape_like_pattern(search_id_number);
  escaped_location := escape_like_pattern(search_location);
  
  -- Require at least one non-empty search parameter
  IF (search_name IS NULL OR trim(search_name) = '') AND 
     (search_id_number IS NULL OR trim(search_id_number) = '') AND 
     (search_id_type IS NULL OR trim(search_id_type) = '') AND 
     (search_location IS NULL OR trim(search_location) = '') THEN
    RAISE EXCEPTION 'At least one search parameter is required';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id,
    f.id_type,
    CASE 
      WHEN f.name_on_id IS NOT NULL THEN 
        LEFT(f.name_on_id, 3) || '***'
      ELSE NULL
    END as name_on_id_masked,
    CASE 
      WHEN f.id_number IS NOT NULL THEN 
        '***' || RIGHT(f.id_number, 4)
      ELSE NULL
    END as id_number_masked,
    f.location_found,
    f.date_found
  FROM public.found_ids f
  WHERE f.status = 'pending'
    AND (
      (escaped_name IS NOT NULL AND trim(escaped_name) != '' AND f.name_on_id ILIKE '%' || escaped_name || '%')
      OR (escaped_id_number IS NOT NULL AND trim(escaped_id_number) != '' AND f.id_number LIKE '%' || escaped_id_number || '%')
      OR (search_id_type IS NOT NULL AND trim(search_id_type) != '' AND f.id_type = search_id_type)
      OR (escaped_location IS NOT NULL AND trim(escaped_location) != '' AND f.location_found ILIKE '%' || escaped_location || '%')
    )
  LIMIT 50; -- Limit results to prevent enumeration
END;
$$;

-- Fix 3: Fix the RLS policy on found_ids - the EXISTS clause references wrong column
DROP POLICY IF EXISTS "Users can view own or verified reports" ON public.found_ids;

CREATE POLICY "Users can view own or verified reports" 
ON public.found_ids 
FOR SELECT 
USING (
  (auth.uid() = reporter_id) 
  OR (EXISTS (
    SELECT 1 FROM verification_requests vr
    WHERE vr.found_id_ref = found_ids.id  -- Fixed: was vr.id, now correctly references found_ids.id
      AND vr.requester_id = auth.uid() 
      AND vr.status = 'approved' 
      AND vr.expires_at > now()
  ))
);