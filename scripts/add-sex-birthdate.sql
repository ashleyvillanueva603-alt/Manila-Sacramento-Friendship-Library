-- Add sex and birth_date columns to users table
ALTER TABLE users 
ADD COLUMN sex ENUM('male', 'female', 'other') DEFAULT NULL AFTER age,
ADD COLUMN birth_date DATE DEFAULT NULL AFTER sex;

-- Add approval_status column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER library_card_number;

-- Add approval_status to borrow_records if it doesn't exist
ALTER TABLE borrow_records 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER status;
