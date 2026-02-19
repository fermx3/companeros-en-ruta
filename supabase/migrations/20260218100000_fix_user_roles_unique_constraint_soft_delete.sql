-- Fix: user_roles_unique_assignment constraint blocks re-assigning soft-deleted roles
-- The old UNIQUE constraint doesn't exclude soft-deleted rows (deleted_at IS NOT NULL),
-- so after removing a role (soft-delete) and trying to re-assign the same combination,
-- PostgreSQL raises "duplicate key value violates unique constraint".
--
-- Solution: Replace the UNIQUE constraint with a partial unique index that only
-- enforces uniqueness on active (non-deleted) rows.
-- COALESCE handles nullable brand_id since PostgreSQL treats NULLs as distinct in indexes.

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_unique_assignment;

CREATE UNIQUE INDEX user_roles_unique_assignment
  ON public.user_roles (
    user_profile_id,
    tenant_id,
    COALESCE(brand_id, '00000000-0000-0000-0000-000000000000'),
    role
  )
  WHERE deleted_at IS NULL;
