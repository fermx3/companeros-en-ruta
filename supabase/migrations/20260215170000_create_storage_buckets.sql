-- ============================================================
-- Migration: Create storage buckets with RLS policies
-- ============================================================
-- Creates:
--   1. brand-logos bucket (new)
--   2. visit-evidence bucket (retro-document, already exists in production)
-- ============================================================

-- 1. Brand logos bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Visit evidence bucket (retro-document — already exists in production)
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-evidence', 'visit-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS Policies for brand-logos
-- ============================================================

-- Public read: anyone can view brand logos
CREATE POLICY "brand_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

-- Authenticated upload: only authenticated users can upload
CREATE POLICY "brand_logos_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'brand-logos');

-- Authenticated update: only authenticated users can replace
CREATE POLICY "brand_logos_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'brand-logos');

-- Authenticated delete: only authenticated users can delete
CREATE POLICY "brand_logos_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'brand-logos');

-- ============================================================
-- RLS Policies for visit-evidence (retro-document)
-- These may already exist — use IF NOT EXISTS pattern via DO block
-- ============================================================

DO $$
BEGIN
  -- Public read for visit evidence
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'visit_evidence_public_read'
  ) THEN
    CREATE POLICY "visit_evidence_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'visit-evidence');
  END IF;

  -- Authenticated upload for visit evidence
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'visit_evidence_auth_upload'
  ) THEN
    CREATE POLICY "visit_evidence_auth_upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'visit-evidence');
  END IF;

  -- Authenticated update for visit evidence
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'visit_evidence_auth_update'
  ) THEN
    CREATE POLICY "visit_evidence_auth_update"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'visit-evidence');
  END IF;

  -- Authenticated delete for visit evidence
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'visit_evidence_auth_delete'
  ) THEN
    CREATE POLICY "visit_evidence_auth_delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'visit-evidence');
  END IF;
END $$;
