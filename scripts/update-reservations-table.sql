-- Add fields to support reservation approval workflow
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMP NULL,
ADD CONSTRAINT fk_reservations_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_reservation_status_approval ON reservations(status, approval_status);
CREATE INDEX IF NOT EXISTS idx_reservation_user_status ON reservations(user_id, status);
