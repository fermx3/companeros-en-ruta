-- Add 'wholesale_market' zone type for centrales de abasto (wholesale markets)
-- This allows proper hierarchical modeling:
-- region → wholesale_market (central de abasto) → clients operating within

-- Add new enum value to zone_type_enum
ALTER TYPE "public"."zone_type_enum" ADD VALUE IF NOT EXISTS 'wholesale_market';

-- Add comment explaining the new zone type
COMMENT ON TYPE "public"."zone_type_enum" IS 'Types of geographic zones:
- country: National level
- region: Regional level (e.g., CDMX, Guanajuato)
- state: State/province level
- city: City level
- district: District/neighborhood level
- wholesale_market: Centrales de abasto (wholesale markets like Merced, Iztapalapa)
- custom: Custom geographic division';

-- Add index on zone_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_zones_zone_type ON "public"."zones" ("zone_type");

-- Add index on parent_zone_id for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_zones_parent_zone_id ON "public"."zones" ("parent_zone_id");
