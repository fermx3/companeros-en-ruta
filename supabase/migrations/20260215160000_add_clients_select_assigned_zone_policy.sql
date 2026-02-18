-- Add missing RLS policy: allow client users to read their assigned zone
-- This mirrors the existing policies for client_types and markets
-- (clients_select_assigned_client_type, clients_select_assigned_market)
-- Without this, the PostgREST join zones(name) returns null for client users

DROP POLICY IF EXISTS "clients_select_assigned_zone" ON "public"."zones";
CREATE POLICY "clients_select_assigned_zone"
  ON "public"."zones"
  FOR SELECT
  USING (
    ("deleted_at" IS NULL)
    AND ("is_active" = true)
    AND (EXISTS (
      SELECT 1
      FROM "public"."clients" "c"
      WHERE (
        ("c"."user_id" = "auth"."uid"())
        AND ("c"."zone_id" = "zones"."id")
        AND ("c"."deleted_at" IS NULL)
      )
    ))
  );
