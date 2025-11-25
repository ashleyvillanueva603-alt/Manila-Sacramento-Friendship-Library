-- Add soft delete support to books table
-- This migration adds a deleted_at column to track soft-deleted books

USE u589325782_library_system;

-- Add deleted_at column to books table
ALTER TABLE books 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER created_at;

-- Add index for better query performance
ALTER TABLE books 
ADD INDEX idx_deleted_at (deleted_at);

-- Optional: Add a view to easily query only active (non-deleted) books
CREATE OR REPLACE VIEW active_books AS
SELECT * FROM books WHERE deleted_at IS NULL;
