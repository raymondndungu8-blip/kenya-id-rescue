-- Fix 1: Restrict SELECT policy to owner-only access
-- This fixes: photo_url_indirect_leak, form_xss_risk (partially), missing_search_ui
DROP POLICY IF EXISTS "Authenticated users can view found IDs" ON public.found_ids;

CREATE POLICY "Users can view their own reports"
ON public.found_ids
FOR SELECT
USING (auth.uid() = reporter_id);

-- Fix 2: Add server-side validation trigger to prevent XSS patterns
-- This provides defense-in-depth for form_xss_risk
CREATE OR REPLACE FUNCTION public.validate_found_ids_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Check description for common XSS patterns
  IF NEW.description IS NOT NULL AND 
     NEW.description ~* '<script|javascript:|on\w+\s*=|data:text/html' THEN
    RAISE EXCEPTION 'Invalid content detected in description';
  END IF;
  
  -- Check location_found for common XSS patterns
  IF NEW.location_found IS NOT NULL AND 
     NEW.location_found ~* '<script|javascript:|on\w+\s*=|data:text/html' THEN
    RAISE EXCEPTION 'Invalid content detected in location';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for validation on INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_found_ids_input_trigger ON public.found_ids;
CREATE TRIGGER validate_found_ids_input_trigger
BEFORE INSERT OR UPDATE ON public.found_ids
FOR EACH ROW EXECUTE FUNCTION public.validate_found_ids_input();