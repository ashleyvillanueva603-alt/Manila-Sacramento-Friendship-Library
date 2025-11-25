-- Add approval fields to borrow_records table
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS approved_by INTEGER NULL;
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Update status enum to include 'pending' if not already present
-- Note: This depends on your database system. For PostgreSQL:
-- ALTER TYPE borrow_status ADD VALUE IF NOT EXISTS 'pending';

-- For MySQL, you might need to alter the column:
-- ALTER TABLE borrow_records MODIFY COLUMN status ENUM('pending', 'borrowed', 'returned', 'overdue') DEFAULT 'pending';
