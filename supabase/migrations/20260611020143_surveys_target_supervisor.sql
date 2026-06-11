-- Adds 'supervisor' to survey_target_role_enum so surveys can target the
-- supervisor role alongside the existing promotor / asesor_de_ventas / client.
--
-- Why: the mobile staff app (apps/mobile) now exposes a Surveys feature for
-- the three staff roles. Without this enum value, supervisor-targeted surveys
-- cannot be created, the targeting filter in /api/surveys cannot match the
-- role, and the respond endpoint cannot persist a supervisor response.
--
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so the
-- BEGIN/COMMIT envelope is intentionally omitted here.

ALTER TYPE survey_target_role_enum ADD VALUE IF NOT EXISTS 'supervisor';
