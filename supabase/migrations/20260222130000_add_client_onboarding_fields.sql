-- =============================================================================
-- Migration: add_client_onboarding_fields
-- Description: Add onboarding columns to clients table, split owner_name,
--              update views to concatenate owner_name + owner_last_name
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1A. New columns on clients
-- -----------------------------------------------------------------------------
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS owner_last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS has_meat_fridge BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_soda_fridge BOOLEAN,
  ADD COLUMN IF NOT EXISTS accepts_card BOOLEAN,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL;

-- gender constraint
ALTER TABLE public.clients
  ADD CONSTRAINT clients_gender_check
  CHECK (gender IS NULL OR gender IN ('masculino','femenino','otro','prefiero_no_decir'));

-- Partial index for fast onboarding lookups
CREATE INDEX IF NOT EXISTS idx_clients_onboarding_pending
  ON public.clients(user_id)
  WHERE onboarding_completed = false AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 1B. Data migration: split owner_name into first/last
-- -----------------------------------------------------------------------------
UPDATE public.clients SET
  owner_last_name = CASE
    WHEN position(' ' IN owner_name) > 0
    THEN substring(owner_name FROM position(' ' IN owner_name) + 1)
    ELSE NULL
  END,
  owner_name = CASE
    WHEN position(' ' IN owner_name) > 0
    THEN substring(owner_name FROM 1 FOR position(' ' IN owner_name) - 1)
    ELSE owner_name
  END
WHERE owner_name IS NOT NULL AND owner_last_name IS NULL;

-- -----------------------------------------------------------------------------
-- 1C. Update views: change c.owner_name to CONCAT_WS(' ', c.owner_name, c.owner_last_name)
-- -----------------------------------------------------------------------------

-- View 1: active_client_brand_memberships
DROP VIEW IF EXISTS "public"."active_client_brand_memberships";
CREATE VIEW "public"."active_client_brand_memberships" AS
 SELECT "cbm"."id",
    "cbm"."public_id",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."tenant_id",
    "cbm"."membership_status",
    "cbm"."joined_date",
    "cbm"."approved_by",
    "cbm"."approved_date",
    "cbm"."current_tier_id",
    "cbm"."lifetime_points",
    "cbm"."points_balance",
    "cbm"."last_purchase_date",
    "cbm"."last_points_earned_date",
    "cbm"."membership_preferences",
    "cbm"."terms_accepted_date",
    "cbm"."terms_version",
    "cbm"."is_primary_brand",
    "cbm"."communication_preferences",
    "cbm"."created_at",
    "cbm"."updated_at",
    "cbm"."deleted_at",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "c"."email" AS "client_email",
    "c"."status" AS "client_status",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "b"."status" AS "brand_status",
    "t"."name" AS "tenant_name",
    "t"."slug" AS "tenant_slug",
    "up"."first_name" AS "approved_by_first_name",
    "up"."last_name" AS "approved_by_last_name",
    CASE
        WHEN ("cbm"."lifetime_points" > (0)::numeric) THEN (("cbm"."points_balance" / "cbm"."lifetime_points") * (100)::numeric)
        ELSE (0)::numeric
    END AS "points_utilization_rate",
    CASE
        WHEN ("cbm"."last_purchase_date" IS NOT NULL) THEN (CURRENT_DATE - "cbm"."last_purchase_date")
        ELSE NULL::integer
    END AS "days_since_last_purchase",
    CASE
        WHEN ("cbm"."joined_date" IS NOT NULL) THEN (CURRENT_DATE - "cbm"."joined_date")
        ELSE NULL::integer
    END AS "membership_days"
   FROM (((("public"."client_brand_memberships" "cbm"
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."tenants" "t" ON (("cbm"."tenant_id" = "t"."id")))
     LEFT JOIN "public"."user_profiles" "up" ON (("cbm"."approved_by" = "up"."id")))
  WHERE (("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "cbm"."tenant_id", "cbm"."brand_id", "cbm"."joined_date" DESC;

-- View 2: active_client_invoice_data
DROP VIEW IF EXISTS "public"."active_client_invoice_data";
CREATE VIEW "public"."active_client_invoice_data" AS
 SELECT "cid"."id",
    "cid"."public_id",
    "cid"."tenant_id",
    "cid"."client_id",
    "cid"."person_type",
    "cid"."invoice_name",
    "cid"."rfc",
    "cid"."business_name",
    "cid"."address_street",
    "cid"."address_neighborhood",
    "cid"."address_city",
    "cid"."address_state",
    "cid"."address_postal_code",
    "cid"."address_country",
    "cid"."cfdi_use",
    "cid"."payment_form",
    "cid"."payment_method",
    "cid"."email_invoice",
    "cid"."is_preferred",
    "cid"."is_active",
    "cid"."tax_regime",
    "cid"."notes",
    "cid"."created_at",
    "cid"."updated_at",
    "cid"."deleted_at",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "c"."email" AS "client_email",
    "t"."name" AS "tenant_name",
    CASE
        WHEN ("cid"."person_type" = 'fisica'::"public"."rfc_person_type_enum") THEN 'Persona Física'::"text"
        WHEN ("cid"."person_type" = 'moral'::"public"."rfc_person_type_enum") THEN 'Persona Moral'::"text"
        ELSE 'No definido'::"text"
    END AS "person_type_description",
    "concat_ws"(', '::"text", "cid"."address_street", "cid"."address_neighborhood", "cid"."address_city", "cid"."address_state", ('CP '::"text" || ("cid"."address_postal_code")::"text"),
        CASE
            WHEN (("cid"."address_country")::"text" <> 'MX'::"text") THEN "cid"."address_country"
            ELSE NULL::character varying
        END) AS "full_address",
    CASE
        WHEN (("cid"."cfdi_use")::"text" = 'G01'::"text") THEN 'Adquisición de mercancías'::character varying
        WHEN (("cid"."cfdi_use")::"text" = 'G02'::"text") THEN 'Devoluciones, descuentos o bonificaciones'::character varying
        WHEN (("cid"."cfdi_use")::"text" = 'G03'::"text") THEN 'Gastos en general'::character varying
        WHEN (("cid"."cfdi_use")::"text" = 'I01'::"text") THEN 'Construcciones'::character varying
        WHEN (("cid"."cfdi_use")::"text" = 'I02'::"text") THEN 'Mobilario y equipo de oficina por inversiones'::character varying
        WHEN (("cid"."cfdi_use")::"text" = 'P01'::"text") THEN 'Por definir'::character varying
        ELSE "cid"."cfdi_use"
    END AS "cfdi_use_description",
    CASE
        WHEN (("cid"."payment_form")::"text" = '01'::"text") THEN 'Efectivo'::character varying
        WHEN (("cid"."payment_form")::"text" = '02'::"text") THEN 'Cheque nominativo'::character varying
        WHEN (("cid"."payment_form")::"text" = '03'::"text") THEN 'Transferencia electrónica de fondos'::character varying
        WHEN (("cid"."payment_form")::"text" = '04'::"text") THEN 'Tarjeta de crédito'::character varying
        WHEN (("cid"."payment_form")::"text" = '28'::"text") THEN 'Tarjeta de débito'::character varying
        WHEN (("cid"."payment_form")::"text" = '99'::"text") THEN 'Por definir'::character varying
        ELSE "cid"."payment_form"
    END AS "payment_form_description",
    CASE
        WHEN (("cid"."payment_method")::"text" = 'PUE'::"text") THEN 'Pago en una sola exhibición'::character varying
        WHEN (("cid"."payment_method")::"text" = 'PPD'::"text") THEN 'Pago en parcialidades o diferido'::character varying
        ELSE "cid"."payment_method"
    END AS "payment_method_description"
   FROM (("public"."client_invoice_data" "cid"
     JOIN "public"."clients" "c" ON (("cid"."client_id" = "c"."id")))
     JOIN "public"."tenants" "t" ON (("cid"."tenant_id" = "t"."id")))
  WHERE (("cid"."deleted_at" IS NULL) AND ("cid"."is_active" = true) AND ("c"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL))
  ORDER BY "cid"."client_id", "cid"."is_preferred" DESC, "cid"."invoice_name";

-- View 3: active_client_tier_assignments
DROP VIEW IF EXISTS "public"."active_client_tier_assignments";
CREATE VIEW "public"."active_client_tier_assignments" AS
 SELECT "cta"."id",
    "cta"."public_id",
    "cta"."tenant_id",
    "cta"."client_brand_membership_id",
    "cta"."tier_id",
    "cta"."assignment_type",
    "cta"."assigned_by",
    "cta"."assigned_date",
    "cta"."effective_from",
    "cta"."effective_until",
    "cta"."previous_tier_id",
    "cta"."reason",
    "cta"."points_at_assignment",
    "cta"."visits_at_assignment",
    "cta"."purchases_at_assignment",
    "cta"."purchase_amount_at_assignment",
    "cta"."evaluation_period_start",
    "cta"."evaluation_period_end",
    "cta"."is_current",
    "cta"."auto_assignment_rule_id",
    "cta"."notification_sent",
    "cta"."notification_sent_at",
    "cta"."client_acknowledgment",
    "cta"."benefits_activated",
    "cta"."assignment_notes",
    "cta"."metadata",
    "cta"."created_at",
    "cta"."updated_at",
    "cta"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "cbm"."joined_date",
    "cbm"."lifetime_points",
    "cbm"."points_balance",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "b"."name" AS "brand_name",
    "t"."name" AS "tier_name",
    "t"."tier_level",
    "t"."points_multiplier",
    "t"."discount_percentage",
    "pt"."name" AS "previous_tier_name",
    "pt"."tier_level" AS "previous_tier_level",
    "up_assigned"."first_name" AS "assigned_by_first_name",
    "up_assigned"."last_name" AS "assigned_by_last_name",
    "tn"."name" AS "tenant_name",
    CASE
        WHEN ("cta"."effective_until" IS NOT NULL) THEN ("cta"."effective_until" - "cta"."effective_from")
        ELSE (CURRENT_DATE - "cta"."effective_from")
    END AS "assignment_duration_days",
    CASE
        WHEN (("cta"."effective_until" IS NOT NULL) AND ("cta"."effective_until" < CURRENT_DATE)) THEN 'expired'::"text"
        WHEN ("cta"."is_current" = true) THEN 'current'::"text"
        WHEN ("cta"."effective_from" > CURRENT_DATE) THEN 'future'::"text"
        ELSE 'historical'::"text"
    END AS "assignment_status",
    CASE
        WHEN ("cta"."previous_tier_id" IS NULL) THEN 'initial'::"text"
        WHEN ("t"."tier_level" > "pt"."tier_level") THEN 'promotion'::"text"
        WHEN ("t"."tier_level" < "pt"."tier_level") THEN 'demotion'::"text"
        ELSE 'lateral'::"text"
    END AS "tier_movement_type",
    (CURRENT_DATE - "cta"."assigned_date") AS "days_since_assignment",
    CASE
        WHEN (("cta"."notification_sent" = true) AND ("cta"."client_acknowledgment" = true)) THEN 'acknowledged'::"text"
        WHEN ("cta"."notification_sent" = true) THEN 'sent_pending'::"text"
        ELSE 'not_sent'::"text"
    END AS "notification_status"
   FROM ((((((("public"."client_tier_assignments" "cta"
     JOIN "public"."client_brand_memberships" "cbm" ON (("cta"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."tiers" "t" ON (("cta"."tier_id" = "t"."id")))
     LEFT JOIN "public"."tiers" "pt" ON (("cta"."previous_tier_id" = "pt"."id")))
     LEFT JOIN "public"."user_profiles" "up_assigned" ON (("cta"."assigned_by" = "up_assigned"."id")))
     JOIN "public"."tenants" "tn" ON (("cta"."tenant_id" = "tn"."id")))
  WHERE (("cta"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "cta"."effective_from" DESC, "cta"."created_at" DESC;

-- View 4: active_orders
DROP VIEW IF EXISTS "public"."active_orders";
CREATE VIEW "public"."active_orders" AS
 SELECT "o"."id",
    "o"."public_id",
    "o"."tenant_id",
    "o"."client_id",
    "o"."brand_id",
    "o"."order_number",
    "o"."order_type",
    "o"."order_status",
    "o"."order_date",
    "o"."requested_delivery_date",
    "o"."confirmed_delivery_date",
    "o"."actual_delivery_date",
    "o"."delivery_time_slot",
    "o"."delivery_address",
    "o"."delivery_instructions",
    "o"."commercial_structure_id",
    "o"."payment_method",
    "o"."payment_status",
    "o"."payment_terms",
    "o"."subtotal",
    "o"."discount_amount",
    "o"."tax_amount",
    "o"."shipping_cost",
    "o"."total_amount",
    "o"."currency",
    "o"."priority",
    "o"."source_channel",
    "o"."invoice_required",
    "o"."client_invoice_data_id",
    "o"."assigned_to",
    "o"."internal_notes",
    "o"."client_notes",
    "o"."tracking_number",
    "o"."estimated_delivery_time",
    "o"."cancellation_reason",
    "o"."cancelled_by",
    "o"."cancelled_at",
    "o"."order_attachments",
    "o"."delivery_confirmation",
    "o"."customer_rating",
    "o"."customer_feedback",
    "o"."metadata",
    "o"."created_at",
    "o"."updated_at",
    "o"."deleted_at",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "b"."name" AS "brand_name",
    "b"."slug" AS "brand_slug",
    "cs"."name" AS "commercial_structure_name",
    "cs"."structure_type",
    "cid"."invoice_name",
    "up_assigned"."first_name" AS "assigned_to_first_name",
    "up_assigned"."last_name" AS "assigned_to_last_name",
    "up_cancelled"."first_name" AS "cancelled_by_first_name",
    "up_cancelled"."last_name" AS "cancelled_by_last_name",
    "tn"."name" AS "tenant_name",
    CASE
        WHEN ("o"."order_status" = 'cancelled'::"public"."order_status_enum") THEN 'cancelled'::"text"
        WHEN ("o"."order_status" = 'returned'::"public"."order_status_enum") THEN 'returned'::"text"
        WHEN ("o"."order_status" = 'completed'::"public"."order_status_enum") THEN 'completed'::"text"
        WHEN (("o"."order_status" = 'delivered'::"public"."order_status_enum") AND ("o"."actual_delivery_date" IS NOT NULL)) THEN 'delivered'::"text"
        WHEN ("o"."order_status" = 'shipped'::"public"."order_status_enum") THEN 'in_transit'::"text"
        WHEN ("o"."order_status" = 'processing'::"public"."order_status_enum") THEN 'processing'::"text"
        WHEN ("o"."order_status" = 'confirmed'::"public"."order_status_enum") THEN 'confirmed'::"text"
        WHEN ("o"."order_status" = 'submitted'::"public"."order_status_enum") THEN 'submitted'::"text"
        ELSE 'draft'::"text"
    END AS "order_display_status",
    (CURRENT_DATE - "o"."order_date") AS "days_since_order",
    CASE
        WHEN ("o"."requested_delivery_date" IS NOT NULL) THEN ("o"."requested_delivery_date" - CURRENT_DATE)
        ELSE NULL::integer
    END AS "days_until_requested_delivery",
    CASE
        WHEN ("o"."confirmed_delivery_date" IS NOT NULL) THEN ("o"."confirmed_delivery_date" - CURRENT_DATE)
        ELSE NULL::integer
    END AS "days_until_confirmed_delivery",
    CASE
        WHEN ("o"."actual_delivery_date" IS NOT NULL) THEN 'delivered'::"text"
        WHEN (("o"."confirmed_delivery_date" IS NOT NULL) AND ("o"."confirmed_delivery_date" < CURRENT_DATE)) THEN 'overdue'::"text"
        WHEN (("o"."requested_delivery_date" IS NOT NULL) AND ("o"."requested_delivery_date" < CURRENT_DATE)) THEN 'delayed'::"text"
        WHEN ("o"."order_status" = ANY (ARRAY['shipped'::"public"."order_status_enum", 'processing'::"public"."order_status_enum"])) THEN 'on_schedule'::"text"
        ELSE 'pending'::"text"
    END AS "delivery_status",
    CASE
        WHEN ("o"."subtotal" > (0)::numeric) THEN (("o"."discount_amount" / "o"."subtotal") * (100)::numeric)
        ELSE (0)::numeric
    END AS "discount_percentage",
    ("o"."total_amount" - "o"."shipping_cost") AS "revenue_amount",
    CASE
        WHEN ("o"."actual_delivery_date" IS NOT NULL) THEN ("o"."actual_delivery_date" - "o"."order_date")
        ELSE NULL::integer
    END AS "processing_days",
    CASE
        WHEN (("o"."customer_rating" IS NOT NULL) AND ("o"."customer_rating" >= 4)) THEN 'satisfied'::"text"
        WHEN (("o"."customer_rating" IS NOT NULL) AND ("o"."customer_rating" >= 3)) THEN 'neutral'::"text"
        WHEN ("o"."customer_rating" IS NOT NULL) THEN 'unsatisfied'::"text"
        ELSE 'not_rated'::"text"
    END AS "satisfaction_level"
   FROM ((((((("public"."orders" "o"
     JOIN "public"."clients" "c" ON (("o"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("o"."brand_id" = "b"."id")))
     JOIN "public"."commercial_structures" "cs" ON (("o"."commercial_structure_id" = "cs"."id")))
     LEFT JOIN "public"."client_invoice_data" "cid" ON (("o"."client_invoice_data_id" = "cid"."id")))
     LEFT JOIN "public"."user_profiles" "up_assigned" ON (("o"."assigned_to" = "up_assigned"."id")))
     LEFT JOIN "public"."user_profiles" "up_cancelled" ON (("o"."cancelled_by" = "up_cancelled"."id")))
     JOIN "public"."tenants" "tn" ON (("o"."tenant_id" = "tn"."id")))
  WHERE (("o"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("cs"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "o"."order_date" DESC, "o"."created_at" DESC;

-- View 5: active_points_transactions
DROP VIEW IF EXISTS "public"."active_points_transactions";
CREATE VIEW "public"."active_points_transactions" AS
 SELECT "pt"."id",
    "pt"."public_id",
    "pt"."tenant_id",
    "pt"."client_brand_membership_id",
    "pt"."transaction_type",
    "pt"."points",
    "pt"."transaction_date",
    "pt"."source_type",
    "pt"."source_id",
    "pt"."source_description",
    "pt"."points_rule_id",
    "pt"."multiplier_applied",
    "pt"."base_points",
    "pt"."expiration_date",
    "pt"."is_expired",
    "pt"."expired_date",
    "pt"."balance_after",
    "pt"."processed_by",
    "pt"."approval_required",
    "pt"."approved_by",
    "pt"."approved_at",
    "pt"."reversal_of",
    "pt"."reversed_by",
    "pt"."campaign_id",
    "pt"."promotion_id",
    "pt"."notes",
    "pt"."metadata",
    "pt"."created_at",
    "pt"."updated_at",
    "pt"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "b"."name" AS "brand_name",
    "up_processed"."first_name" AS "processed_by_first_name",
    "up_processed"."last_name" AS "processed_by_last_name",
    "up_approved"."first_name" AS "approved_by_first_name",
    "up_approved"."last_name" AS "approved_by_last_name",
    "pt_reversal"."public_id" AS "reversal_of_public_id",
    "pt_reversed"."public_id" AS "reversed_by_public_id",
    "tn"."name" AS "tenant_name",
    CASE
        WHEN ("pt"."reversed_by" IS NOT NULL) THEN 'reversed'::"text"
        WHEN ("pt"."reversal_of" IS NOT NULL) THEN 'reversal'::"text"
        WHEN (("pt"."approval_required" = true) AND ("pt"."approved_by" IS NULL)) THEN 'pending_approval'::"text"
        WHEN ("pt"."is_expired" = true) THEN 'expired'::"text"
        ELSE 'active'::"text"
    END AS "transaction_status",
    CASE
        WHEN (("pt"."expiration_date" IS NOT NULL) AND ("pt"."is_expired" = false)) THEN ("pt"."expiration_date" - CURRENT_DATE)
        ELSE NULL::integer
    END AS "days_until_expiration",
    (CURRENT_DATE - "pt"."transaction_date") AS "days_since_transaction",
    CASE
        WHEN ("pt"."points" > (0)::numeric) THEN 'credit'::"text"
        WHEN ("pt"."points" < (0)::numeric) THEN 'debit'::"text"
        ELSE 'neutral'::"text"
    END AS "points_classification",
    "abs"("pt"."points") AS "points_absolute",
    CASE
        WHEN (("pt"."base_points" IS NOT NULL) AND ("pt"."base_points" > (0)::numeric)) THEN ("pt"."points" / "pt"."base_points")
        ELSE "pt"."multiplier_applied"
    END AS "effective_multiplier"
   FROM (((((((("public"."points_transactions" "pt"
     JOIN "public"."client_brand_memberships" "cbm" ON (("pt"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     LEFT JOIN "public"."user_profiles" "up_processed" ON (("pt"."processed_by" = "up_processed"."id")))
     LEFT JOIN "public"."user_profiles" "up_approved" ON (("pt"."approved_by" = "up_approved"."id")))
     LEFT JOIN "public"."points_transactions" "pt_reversal" ON (("pt"."reversal_of" = "pt_reversal"."id")))
     LEFT JOIN "public"."points_transactions" "pt_reversed" ON (("pt"."reversed_by" = "pt_reversed"."id")))
     JOIN "public"."tenants" "tn" ON (("pt"."tenant_id" = "tn"."id")))
  WHERE (("pt"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "pt"."transaction_date" DESC, "pt"."created_at" DESC;

-- View 6: active_promotion_redemptions
DROP VIEW IF EXISTS "public"."active_promotion_redemptions";
CREATE VIEW "public"."active_promotion_redemptions" AS
 SELECT "pr"."id",
    "pr"."public_id",
    "pr"."tenant_id",
    "pr"."client_brand_membership_id",
    "pr"."promotion_id",
    "pr"."order_type",
    "pr"."order_id",
    "pr"."redemption_date",
    "pr"."redemption_status",
    "pr"."promotion_type_applied",
    "pr"."original_promotion_value",
    "pr"."applied_discount_amount",
    "pr"."applied_percentage",
    "pr"."free_items_quantity",
    "pr"."points_multiplier_applied",
    "pr"."bonus_points_awarded",
    "pr"."order_subtotal_at_application",
    "pr"."minimum_met",
    "pr"."maximum_discount_reached",
    "pr"."rules_validation",
    "pr"."auto_applied",
    "pr"."applied_by",
    "pr"."validation_required",
    "pr"."validated_by",
    "pr"."validated_at",
    "pr"."reversal_reason",
    "pr"."reversed_by",
    "pr"."reversed_at",
    "pr"."client_notification_sent",
    "pr"."internal_notes",
    "pr"."metadata",
    "pr"."created_at",
    "pr"."updated_at",
    "pr"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "b"."name" AS "brand_name",
    "p"."name" AS "promotion_name",
    "p"."promotion_type",
    "p"."status" AS "promotion_status",
    "up_applied"."first_name" AS "applied_by_first_name",
    "up_applied"."last_name" AS "applied_by_last_name",
    "up_validated"."first_name" AS "validated_by_first_name",
    "up_validated"."last_name" AS "validated_by_last_name",
    "up_reversed"."first_name" AS "reversed_by_first_name",
    "up_reversed"."last_name" AS "reversed_by_last_name",
    "tn"."name" AS "tenant_name",
    CASE
        WHEN ("pr"."redemption_status" = 'reversed'::"public"."promotion_redemption_status_enum") THEN 'reversed'::"text"
        WHEN ("pr"."redemption_status" = 'rejected'::"public"."promotion_redemption_status_enum") THEN 'rejected'::"text"
        WHEN ("pr"."redemption_status" = 'validated'::"public"."promotion_redemption_status_enum") THEN 'validated'::"text"
        WHEN ("pr"."redemption_status" = 'pending_validation'::"public"."promotion_redemption_status_enum") THEN 'pending_validation'::"text"
        ELSE 'applied'::"text"
    END AS "redemption_display_status",
    (CURRENT_DATE - "pr"."redemption_date") AS "days_since_redemption",
    CASE
        WHEN ("pr"."order_subtotal_at_application" > (0)::numeric) THEN (("pr"."applied_discount_amount" / "pr"."order_subtotal_at_application") * (100)::numeric)
        ELSE (0)::numeric
    END AS "discount_percentage_effective",
    ("pr"."applied_discount_amount" + "pr"."bonus_points_awarded") AS "total_benefit_value",
    CASE
        WHEN ("pr"."auto_applied" = true) THEN 'automatic'::"text"
        WHEN ("pr"."applied_by" IS NOT NULL) THEN 'manual'::"text"
        ELSE 'system'::"text"
    END AS "application_type",
    CASE
        WHEN ("pr"."validation_required" = false) THEN 'not_required'::"text"
        WHEN ("pr"."validated_by" IS NOT NULL) THEN 'completed'::"text"
        WHEN ("pr"."redemption_status" = 'pending_validation'::"public"."promotion_redemption_status_enum") THEN 'pending'::"text"
        ELSE 'not_validated'::"text"
    END AS "validation_status",
    CASE
        WHEN ("pr"."order_type" = 'independent_order'::"public"."promotion_order_type_enum") THEN 'Portal Cliente'::"text"
        WHEN ("pr"."order_type" = 'visit_order'::"public"."promotion_order_type_enum") THEN 'Visita Asesor'::"text"
        ELSE 'Desconocido'::"text"
    END AS "order_source_description"
   FROM (((((((("public"."promotion_redemptions" "pr"
     JOIN "public"."client_brand_memberships" "cbm" ON (("pr"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."promotions" "p" ON (("pr"."promotion_id" = "p"."id")))
     LEFT JOIN "public"."user_profiles" "up_applied" ON (("pr"."applied_by" = "up_applied"."id")))
     LEFT JOIN "public"."user_profiles" "up_validated" ON (("pr"."validated_by" = "up_validated"."id")))
     LEFT JOIN "public"."user_profiles" "up_reversed" ON (("pr"."reversed_by" = "up_reversed"."id")))
     JOIN "public"."tenants" "tn" ON (("pr"."tenant_id" = "tn"."id")))
  WHERE (("pr"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("p"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "pr"."redemption_date" DESC, "pr"."created_at" DESC;

-- View 7: active_reward_redemptions
DROP VIEW IF EXISTS "public"."active_reward_redemptions";
CREATE VIEW "public"."active_reward_redemptions" AS
 SELECT "rr"."id",
    "rr"."public_id",
    "rr"."tenant_id",
    "rr"."client_brand_membership_id",
    "rr"."reward_id",
    "rr"."points_transaction_id",
    "rr"."redemption_date",
    "rr"."redemption_status",
    "rr"."applied_to_order_id",
    "rr"."applied_amount",
    "rr"."original_reward_value",
    "rr"."expiration_date",
    "rr"."used_date",
    "rr"."redemption_code",
    "rr"."redeemed_by",
    "rr"."validated_by",
    "rr"."validation_notes",
    "rr"."client_notes",
    "rr"."cancellation_reason",
    "rr"."cancelled_by",
    "rr"."cancelled_at",
    "rr"."refund_transaction_id",
    "rr"."notification_sent",
    "rr"."notification_sent_at",
    "rr"."usage_instructions",
    "rr"."metadata",
    "rr"."created_at",
    "rr"."updated_at",
    "rr"."deleted_at",
    "cbm"."client_id",
    "cbm"."brand_id",
    "cbm"."membership_status",
    "c"."business_name" AS "client_business_name",
    CONCAT_WS(' ', "c"."owner_name", "c"."owner_last_name") AS "client_owner_name",
    "b"."name" AS "brand_name",
    "r"."name" AS "reward_name",
    "r"."reward_type",
    "r"."points_cost" AS "reward_points_cost",
    "up_redeemed"."first_name" AS "redeemed_by_first_name",
    "up_redeemed"."last_name" AS "redeemed_by_last_name",
    "up_validated"."first_name" AS "validated_by_first_name",
    "up_validated"."last_name" AS "validated_by_last_name",
    "up_cancelled"."first_name" AS "cancelled_by_first_name",
    "up_cancelled"."last_name" AS "cancelled_by_last_name",
    "pt"."points" AS "points_deducted",
    "pt_refund"."points" AS "points_refunded",
    "tn"."name" AS "tenant_name",
    CASE
        WHEN ("rr"."redemption_status" = 'cancelled'::"public"."redemption_status_enum") THEN 'cancelled'::"text"
        WHEN (("rr"."expiration_date" IS NOT NULL) AND ("rr"."expiration_date" < CURRENT_DATE) AND ("rr"."redemption_status" <> 'applied'::"public"."redemption_status_enum")) THEN 'expired'::"text"
        WHEN ("rr"."redemption_status" = 'applied'::"public"."redemption_status_enum") THEN 'completed'::"text"
        WHEN ("rr"."redemption_status" = 'confirmed'::"public"."redemption_status_enum") THEN 'ready_to_use'::"text"
        ELSE 'pending'::"text"
    END AS "redemption_display_status",
    CASE
        WHEN (("rr"."expiration_date" IS NOT NULL) AND ("rr"."redemption_status" <> ALL (ARRAY['applied'::"public"."redemption_status_enum", 'cancelled'::"public"."redemption_status_enum"]))) THEN ("rr"."expiration_date" - CURRENT_DATE)
        ELSE NULL::integer
    END AS "days_until_expiration",
    (CURRENT_DATE - "rr"."redemption_date") AS "days_since_redemption",
    CASE
        WHEN ("rr"."used_date" IS NOT NULL) THEN ("rr"."used_date" - "rr"."redemption_date")
        ELSE NULL::integer
    END AS "days_to_use",
    CASE
        WHEN (("rr"."applied_amount" IS NOT NULL) AND ("rr"."original_reward_value" > (0)::numeric)) THEN (("rr"."applied_amount" / "rr"."original_reward_value") * (100)::numeric)
        ELSE NULL::numeric
    END AS "value_utilization_percentage",
    CASE
        WHEN ("rr"."applied_amount" IS NOT NULL) THEN "rr"."applied_amount"
        WHEN ("rr"."redemption_status" = 'applied'::"public"."redemption_status_enum") THEN "rr"."original_reward_value"
        ELSE NULL::numeric
    END AS "actual_savings"
   FROM (((((((((("public"."reward_redemptions" "rr"
     JOIN "public"."client_brand_memberships" "cbm" ON (("rr"."client_brand_membership_id" = "cbm"."id")))
     JOIN "public"."clients" "c" ON (("cbm"."client_id" = "c"."id")))
     JOIN "public"."brands" "b" ON (("cbm"."brand_id" = "b"."id")))
     JOIN "public"."rewards" "r" ON (("rr"."reward_id" = "r"."id")))
     JOIN "public"."points_transactions" "pt" ON (("rr"."points_transaction_id" = "pt"."id")))
     LEFT JOIN "public"."points_transactions" "pt_refund" ON (("rr"."refund_transaction_id" = "pt_refund"."id")))
     LEFT JOIN "public"."user_profiles" "up_redeemed" ON (("rr"."redeemed_by" = "up_redeemed"."id")))
     LEFT JOIN "public"."user_profiles" "up_validated" ON (("rr"."validated_by" = "up_validated"."id")))
     LEFT JOIN "public"."user_profiles" "up_cancelled" ON (("rr"."cancelled_by" = "up_cancelled"."id")))
     JOIN "public"."tenants" "tn" ON (("rr"."tenant_id" = "tn"."id")))
  WHERE (("rr"."deleted_at" IS NULL) AND ("cbm"."deleted_at" IS NULL) AND ("c"."deleted_at" IS NULL) AND ("b"."deleted_at" IS NULL) AND ("r"."deleted_at" IS NULL) AND ("pt"."deleted_at" IS NULL) AND ("tn"."deleted_at" IS NULL))
  ORDER BY "rr"."redemption_date" DESC, "rr"."created_at" DESC;

-- View 8: active_visit_orders (was recreated in promotor migration, must DROP+CREATE)
DROP VIEW IF EXISTS "public"."active_visit_orders";
CREATE VIEW "public"."active_visit_orders" AS
SELECT vo.id,
    vo.public_id,
    vo.tenant_id,
    vo.visit_id,
    vo.client_id,
    vo.promotor_id,
    vo.order_number,
    vo.order_type,
    vo.order_status,
    vo.order_date,
    vo.delivery_date,
    vo.delivery_address,
    vo.payment_method,
    vo.payment_terms,
    vo.subtotal,
    vo.discount_amount,
    vo.tax_amount,
    vo.total_amount,
    vo.currency,
    vo.exchange_rate,
    vo.requires_approval,
    vo.approved_by,
    vo.approved_at,
    vo.invoice_required,
    vo.client_invoice_data_id,
    vo.delivery_instructions,
    vo.order_notes,
    vo.external_order_id,
    vo.commission_rate,
    vo.commission_amount,
    vo.order_attachments,
    vo.created_at,
    vo.updated_at,
    vo.deleted_at,
    v.visit_date,
    v.visit_status,
    v.workflow_status AS visit_workflow_status,
    up_promotor.first_name AS promotor_first_name,
    up_promotor.last_name AS promotor_last_name,
    up_approver.first_name AS approved_by_first_name,
    up_approver.last_name AS approved_by_last_name,
    c.business_name AS client_business_name,
    CONCAT_WS(' ', c.owner_name, c.owner_last_name) AS client_owner_name,
    cid.business_name AS invoice_business_name,
    cid.rfc AS invoice_rfc,
    t.name AS tenant_name,
    CASE
        WHEN vo.order_status = 'delivered'::visit_order_status_enum THEN 'completed'::text
        WHEN vo.order_status = 'cancelled'::visit_order_status_enum THEN 'cancelled'::text
        WHEN vo.requires_approval = true AND vo.approved_by IS NULL THEN 'pending_approval'::text
        WHEN vo.delivery_date IS NOT NULL AND vo.delivery_date < CURRENT_DATE AND (vo.order_status = ANY (ARRAY['confirmed'::visit_order_status_enum, 'processed'::visit_order_status_enum])) THEN 'overdue'::text
        ELSE vo.order_status::text
    END AS order_display_status,
    CASE
        WHEN vo.delivery_date IS NOT NULL THEN vo.delivery_date - CURRENT_DATE
        ELSE NULL::integer
    END AS days_until_delivery,
    CASE
        WHEN vo.commission_rate IS NOT NULL AND vo.subtotal > 0::numeric THEN vo.subtotal * vo.commission_rate
        ELSE vo.commission_amount
    END AS calculated_commission,
    CASE
        WHEN vo.order_attachments IS NOT NULL THEN jsonb_array_length(vo.order_attachments)
        ELSE 0
    END AS attachment_count,
    CASE
        WHEN vo.currency::text <> 'MXN'::text AND vo.exchange_rate <> 1.0000 THEN vo.total_amount * vo.exchange_rate
        ELSE vo.total_amount
    END AS total_amount_mxn
FROM visit_orders vo
    JOIN visits v ON vo.visit_id = v.id
    JOIN user_profiles up_promotor ON vo.promotor_id = up_promotor.id
    LEFT JOIN user_profiles up_approver ON vo.approved_by = up_approver.id
    JOIN clients c ON vo.client_id = c.id
    LEFT JOIN client_invoice_data cid ON vo.client_invoice_data_id = cid.id
    JOIN tenants t ON vo.tenant_id = t.id
WHERE vo.deleted_at IS NULL AND v.deleted_at IS NULL AND up_promotor.deleted_at IS NULL AND c.deleted_at IS NULL AND t.deleted_at IS NULL
ORDER BY vo.created_at DESC;

-- View 9: active_visits (was recreated in promotor migration, must DROP+CREATE)
DROP VIEW IF EXISTS "public"."active_visits";
CREATE VIEW "public"."active_visits" AS
SELECT v.id,
    v.public_id,
    v.tenant_id,
    v.promotor_id,
    v.client_id,
    v.visit_date,
    v.visit_time_start,
    v.visit_time_end,
    v.visit_type,
    v.visit_status,
    v.workflow_status,
    v.location_coordinates,
    v.check_in_time,
    v.check_out_time,
    v.duration_minutes,
    v.visit_objective,
    v.visit_notes,
    v.next_visit_date,
    v.client_satisfaction_rating,
    v.promotor_notes,
    v.supervisor_notes,
    v.requires_follow_up,
    v.follow_up_reason,
    v.weather_conditions,
    v.visit_attachments,
    v.metadata,
    v.created_at,
    v.updated_at,
    v.deleted_at,
    t.name AS tenant_name,
    up.first_name AS promotor_first_name,
    up.last_name AS promotor_last_name,
    up.email AS promotor_email,
    c.business_name AS client_business_name,
    CONCAT_WS(' ', c.owner_name, c.owner_last_name) AS client_owner_name,
    z.name AS client_zone_name,
    m.name AS client_market_name,
    sup.first_name AS supervisor_first_name,
    sup.last_name AS supervisor_last_name,
    CASE
        WHEN v.check_in_time IS NOT NULL AND v.check_out_time IS NULL THEN EXTRACT(epoch FROM now() - v.check_in_time) / 60::numeric
        ELSE v.duration_minutes::numeric
    END AS effective_duration_minutes,
    CASE
        WHEN v.visit_status = 'completed'::visit_status_enum AND v.workflow_status = 'completed'::visit_workflow_status_enum THEN 'fully_completed'::text
        WHEN v.visit_status = 'completed'::visit_status_enum AND v.workflow_status <> 'completed'::visit_workflow_status_enum THEN 'visit_completed_workflow_pending'::text
        WHEN v.visit_status = 'in_progress'::visit_status_enum THEN 'in_progress'::text
        WHEN v.visit_date < CURRENT_DATE AND v.visit_status = 'planned'::visit_status_enum THEN 'overdue'::text
        ELSE v.visit_status::text
    END AS overall_status,
    CURRENT_DATE - v.visit_date AS days_since_visit,
    CASE
        WHEN v.next_visit_date IS NOT NULL THEN v.next_visit_date - CURRENT_DATE
        ELSE NULL::integer
    END AS days_until_next_visit
FROM visits v
    JOIN tenants t ON v.tenant_id = t.id
    JOIN user_profiles up ON v.promotor_id = up.id
    JOIN clients c ON v.client_id = c.id
    JOIN zones z ON c.zone_id = z.id
    JOIN markets m ON c.market_id = m.id
    LEFT JOIN user_profiles sup ON up.manager_id = sup.id
WHERE v.deleted_at IS NULL AND t.deleted_at IS NULL AND up.deleted_at IS NULL AND c.deleted_at IS NULL
ORDER BY v.visit_date DESC, v.created_at DESC;

-- View 10: clients_with_inherited_values (also add owner_last_name)
DROP VIEW IF EXISTS "public"."clients_with_inherited_values";
CREATE VIEW "public"."clients_with_inherited_values" AS
 SELECT "c"."id",
    "c"."public_id",
    "c"."tenant_id",
    "c"."user_id",
    "c"."business_name",
    "c"."legal_name",
    "c"."owner_name",
    "c"."owner_last_name",
    "c"."email",
    "c"."phone",
    "c"."whatsapp",
    "c"."tax_id",
    "c"."zone_id",
    "c"."market_id",
    "c"."client_type_id",
    "c"."commercial_structure_id",
    "c"."address_street",
    "c"."address_neighborhood",
    "c"."address_city",
    "c"."address_state",
    "c"."address_postal_code",
    "c"."address_country",
    "c"."coordinates",
    "c"."visit_frequency_days",
    "c"."assessment_frequency_days",
    "c"."payment_terms",
    "c"."minimum_order",
    "c"."credit_limit",
    "c"."status",
    "c"."registration_date",
    "c"."last_visit_date",
    "c"."notes",
    "c"."metadata",
    "c"."created_at",
    "c"."updated_at",
    "c"."deleted_at",
    "t"."name" AS "tenant_name",
    "z"."name" AS "zone_name",
    "z"."code" AS "zone_code",
    "m"."name" AS "market_name",
    "m"."code" AS "market_code",
    "ct"."name" AS "client_type_name",
    "ct"."code" AS "client_type_code",
    "cs"."name" AS "commercial_structure_name",
    "cs"."code" AS "commercial_structure_code",
    COALESCE("c"."visit_frequency_days", "ct"."default_visit_frequency_days") AS "effective_visit_frequency_days",
    COALESCE("c"."assessment_frequency_days", "ct"."assessment_frequency_days") AS "effective_assessment_frequency_days",
    COALESCE("c"."payment_terms", "cs"."payment_terms") AS "effective_payment_terms",
    COALESCE("c"."minimum_order", "cs"."minimum_order") AS "effective_minimum_order",
    ("c"."visit_frequency_days" IS NULL) AS "inherits_visit_frequency",
    ("c"."assessment_frequency_days" IS NULL) AS "inherits_assessment_frequency",
    ("c"."payment_terms" IS NULL) AS "inherits_payment_terms",
    ("c"."minimum_order" IS NULL) AS "inherits_minimum_order"
   FROM ((((("public"."clients" "c"
     JOIN "public"."tenants" "t" ON (("c"."tenant_id" = "t"."id")))
     JOIN "public"."zones" "z" ON (("c"."zone_id" = "z"."id")))
     JOIN "public"."markets" "m" ON (("c"."market_id" = "m"."id")))
     JOIN "public"."client_types" "ct" ON (("c"."client_type_id" = "ct"."id")))
     JOIN "public"."commercial_structures" "cs" ON (("c"."commercial_structure_id" = "cs"."id")))
  WHERE (("c"."deleted_at" IS NULL) AND ("t"."deleted_at" IS NULL) AND ("z"."deleted_at" IS NULL) AND ("m"."deleted_at" IS NULL) AND ("ct"."deleted_at" IS NULL) AND ("cs"."deleted_at" IS NULL))
  ORDER BY "c"."tenant_id", "c"."business_name";
