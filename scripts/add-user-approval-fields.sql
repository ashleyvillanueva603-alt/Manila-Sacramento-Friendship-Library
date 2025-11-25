-- Add approval fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INTEGER NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education_level VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS school VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_category VARCHAR(100) NULL;

-- Update existing users to be approved (for backward compatibility)
UPDATE users SET approved = TRUE WHERE role = 'librarian';
