-- Add new notification type enum values for expanded notification coverage
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'points_adjusted';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'assignment_changed';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'supervisor_changed';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'welcome';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'membership_pending';
ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'client_status_changed';
