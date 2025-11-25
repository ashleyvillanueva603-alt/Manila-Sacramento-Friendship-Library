-- Add missing user registration fields if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL AFTER phone_number;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sex ENUM('male', 'female', 'other') DEFAULT NULL AFTER age;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL AFTER sex;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS professional_category VARCHAR(100) DEFAULT NULL AFTER school;

-- Ensure approved column exists with proper default
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE AFTER professional_category;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_by INT NULL AFTER approved_at;
