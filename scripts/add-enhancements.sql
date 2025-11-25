-- Add new fields to users table for enhanced registration
ALTER TABLE users 
ADD COLUMN education_level ENUM('elementary', 'junior_high', 'senior_high', 'college', 'professional') AFTER role,
ADD COLUMN school VARCHAR(255) AFTER education_level,
ADD COLUMN professional_category VARCHAR(100) AFTER school,
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER is_active,
ADD COLUMN approved_by INT NULL AFTER approval_status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at,
ADD INDEX idx_approval_status (approval_status),
ADD INDEX idx_education_level (education_level);

-- Add accession number to books table
ALTER TABLE books 
ADD COLUMN accession_number VARCHAR(50) UNIQUE AFTER isbn,
ADD INDEX idx_accession_number (accession_number);

-- Create reports table for exportable reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type ENUM('descriptive', 'prescriptive', 'combined') NOT NULL,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    data JSON NOT NULL,
    file_path VARCHAR(500),
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_report_type (report_type),
    INDEX idx_generated_at (generated_at),
    INDEX idx_generated_by (generated_by)
);
