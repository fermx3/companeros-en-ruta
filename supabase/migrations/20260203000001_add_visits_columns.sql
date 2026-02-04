-- Migration: Add missing columns to visits table
-- Date: 2026-02-03
-- Description: Add brand_id, latitude, longitude columns to visits table

-- Add brand_id column with FK to brands
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Add latitude column for geolocation
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);

-- Add longitude column for geolocation
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Create index on brand_id for faster queries
CREATE INDEX IF NOT EXISTS idx_visits_brand_id ON visits(brand_id);

-- Add comment
COMMENT ON COLUMN visits.brand_id IS 'Brand associated with this visit (from advisor role)';
COMMENT ON COLUMN visits.latitude IS 'GPS latitude of visit location';
COMMENT ON COLUMN visits.longitude IS 'GPS longitude of visit location';
