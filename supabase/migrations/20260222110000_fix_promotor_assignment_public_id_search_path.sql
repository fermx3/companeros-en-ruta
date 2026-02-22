-- Fix: generate_promotor_assignment_public_id() and generate_promotor_client_assignment_public_id()
-- fail on INSERT because they reference tables without schema qualification,
-- but have SET search_path = '' (applied by a previous migration).
-- Solution: schema-qualify the table references with public.

CREATE OR REPLACE FUNCTION public.generate_promotor_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'PA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.promotor_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_promotor_client_assignment_public_id()
RETURNS character varying
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    new_id VARCHAR;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_id := 'PCA-' || LPAD(counter::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.promotor_client_assignments WHERE public_id = new_id);
        counter := counter + 1;
    END LOOP;
    RETURN new_id;
END;
$$;
