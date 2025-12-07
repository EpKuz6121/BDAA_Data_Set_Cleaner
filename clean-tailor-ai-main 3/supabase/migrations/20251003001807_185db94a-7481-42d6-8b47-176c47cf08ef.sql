-- Fix the security warning by recreating the function with search_path
DROP TRIGGER IF EXISTS update_datasets_updated_at ON public.datasets;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();