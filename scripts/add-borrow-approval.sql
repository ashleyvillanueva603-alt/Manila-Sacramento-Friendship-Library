-- Add approval workflow for borrow requests
ALTER TABLE borrow_records 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER status,
ADD COLUMN approved_by INT NULL AFTER approval_status,
ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at;

-- Add foreign key for approved_by
ALTER TABLE borrow_records
ADD CONSTRAINT fk_borrow_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
