-- Add accession_number column to books table for unique copy tracking
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS accession_number VARCHAR(100) DEFAULT NULL AFTER isbn;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accession_number ON books(accession_number);
