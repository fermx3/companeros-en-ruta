-- Migration: Add location columns to clients table
-- Date: 2026-02-04
-- Description: Add latitude, longitude columns to clients table for store location

-- Add latitude column for geolocation
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);

-- Add longitude column for geolocation
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Add comments
COMMENT ON COLUMN clients.latitude IS 'GPS latitude of client store location';
COMMENT ON COLUMN clients.longitude IS 'GPS longitude of client store location';
