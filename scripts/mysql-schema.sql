-- Library Management System MySQL Database Schema
-- Created to replace IndexedDB with MySQL backend

CREATE DATABASE IF NOT EXISTS library_system;
USE library_system;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('librarian', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    student_id VARCHAR(50),
    phone_number VARCHAR(20),
    address TEXT,
    profile_picture VARCHAR(500),
    library_card_number VARCHAR(50) UNIQUE,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_student_id (student_id),
    INDEX idx_library_card (library_card_number)
);

-- Books table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    genre VARCHAR(100) NOT NULL,
    description TEXT,
    published_year INT,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    cover_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    google_books_id VARCHAR(100),
    publisher VARCHAR(255),
    page_count INT,
    language VARCHAR(10) DEFAULT 'en',
    categories JSON,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_genre (genre),
    INDEX idx_google_books_id (google_books_id),
    FULLTEXT idx_search (title, author, description)
);

-- Borrow records table
CREATE TABLE borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NULL,
    status ENUM('borrowed', 'returned', 'overdue') NOT NULL DEFAULT 'borrowed',
    renewal_count INT DEFAULT 0,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_user_status (user_id, status)
);

-- Reservations table
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_user_status (user_id, status)
);

-- Book requests table
CREATE TABLE book_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'fulfilled') NOT NULL DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP NULL,
    librarian_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_request_date (request_date),
    INDEX idx_user_status (user_id, status)
);

-- Fines table
CREATE TABLE fines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    borrow_record_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('pending', 'paid', 'waived') NOT NULL DEFAULT 'pending',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_date TIMESTAMP NULL,
    payment_method VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (borrow_record_id) REFERENCES borrow_records(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_borrow_record_id (borrow_record_id),
    INDEX idx_status (status),
    INDEX idx_created_date (created_date),
    INDEX idx_user_status (user_id, status)
);

-- Notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('email', 'sms', 'system') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_date TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_date (created_date),
    INDEX idx_user_type (user_id, type)
);

-- Create triggers for automatic fine calculation
DELIMITER //

CREATE TRIGGER update_overdue_status
AFTER UPDATE ON borrow_records
FOR EACH ROW
BEGIN
    IF NEW.return_date IS NULL AND NEW.due_date < NOW() AND NEW.status != 'overdue' THEN
        UPDATE borrow_records SET status = 'overdue' WHERE id = NEW.id;
    END IF;
END//

CREATE TRIGGER calculate_fine_on_return
AFTER UPDATE ON borrow_records
FOR EACH ROW
BEGIN
    DECLARE days_overdue INT;
    DECLARE fine_per_day DECIMAL(10,2) DEFAULT 1.00;
    
    IF NEW.return_date IS NOT NULL AND OLD.return_date IS NULL AND NEW.due_date < NEW.return_date THEN
        SET days_overdue = DATEDIFF(NEW.return_date, NEW.due_date);
        IF days_overdue > 0 THEN
            UPDATE borrow_records 
            SET fine_amount = days_overdue * fine_per_day 
            WHERE id = NEW.id;
            
            INSERT INTO fines (user_id, borrow_record_id, amount, reason)
            VALUES (NEW.user_id, NEW.id, days_overdue * fine_per_day, CONCAT('Late return - ', days_overdue, ' days overdue'));
        END IF;
    END IF;
END//

DELIMITER ;

-- Create borrow_history view to support analytics and recommender systems
-- This view maps to borrow_records table for compatibility with analytics queries
CREATE OR REPLACE VIEW borrow_history AS
SELECT 
    id,
    user_id,
    book_id,
    borrow_date,
    due_date,
    return_date,
    status,
    renewal_count,
    fine_amount,
    fine_paid
FROM borrow_records;
