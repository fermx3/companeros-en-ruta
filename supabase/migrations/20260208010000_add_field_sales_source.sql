-- Migration: Add 'field_sales' to order_source_channel_enum
-- Purpose: Enable Asesor de Ventas to create orders from field visits
-- TASK-002c: Asesor de Ventas Orders Module

-- Add the new enum value if it doesn't exist
DO $$
BEGIN
    -- Check if value already exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'public.order_source_channel_enum'::regtype
        AND enumlabel = 'field_sales'
    ) THEN
        ALTER TYPE public.order_source_channel_enum ADD VALUE 'field_sales';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON TYPE public.order_source_channel_enum IS 'Source channels for orders: client_portal, mobile_app, whatsapp, phone, email, field_sales (asesor de ventas)';
