-- SQL Views and Stored Procedures for Descriptive Analytics

-- Updated to match mysql-schema.sql structure (using genre instead of category, INT for IDs)

-- View: Book Usage Statistics
CREATE OR REPLACE VIEW vw_book_usage_stats AS
SELECT 
    b.id AS book_id,
    b.title,
    b.author,
    b.genre,
    b.available_copies,
    b.total_copies,
    COUNT(bh.id) AS total_borrows,
    COUNT(DISTINCT bh.user_id) AS unique_borrowers,
    AVG(CASE 
        WHEN bh.return_date IS NOT NULL 
        THEN DATEDIFF(bh.return_date, bh.borrow_date) 
        ELSE NULL 
    END) AS avg_borrow_duration,
    MAX(bh.borrow_date) AS last_borrowed,
    (COUNT(bh.id) * 0.4 + 
     COUNT(DISTINCT bh.user_id) * 0.4 + 
     (CASE 
        WHEN MAX(bh.borrow_date) IS NOT NULL 
        THEN (1 - DATEDIFF(NOW(), MAX(bh.borrow_date)) / 365) * 20 
        ELSE 0 
     END)) AS popularity_score
FROM books b
LEFT JOIN borrow_history bh ON b.id = bh.book_id
GROUP BY b.id, b.title, b.author, b.genre, b.available_copies, b.total_copies
ORDER BY popularity_score DESC;

-- View: Borrower Preferences
CREATE OR REPLACE VIEW vw_borrower_preferences AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.role,
    COUNT(bh.id) AS total_borrows,
    COUNT(DISTINCT b.genre) AS categories_explored,
    COUNT(DISTINCT b.author) AS authors_read,
    AVG(CASE 
        WHEN bh.return_date IS NOT NULL 
        THEN DATEDIFF(bh.return_date, bh.borrow_date) 
        ELSE NULL 
    END) AS avg_reading_time,
    CASE 
        WHEN COUNT(bh.id) > 20 THEN 'frequent'
        WHEN COUNT(bh.id) > 10 THEN 'moderate'
        ELSE 'occasional'
    END AS reading_pattern
FROM users u
LEFT JOIN borrow_history bh ON u.id = bh.user_id
LEFT JOIN books b ON bh.book_id = b.id
GROUP BY u.id, u.name, u.role;

-- View: Category Analytics
CREATE OR REPLACE VIEW vw_category_analytics AS
SELECT 
    b.genre AS category,
    COUNT(DISTINCT b.id) AS total_books,
    COUNT(bh.id) AS total_borrows,
    COUNT(bh.id) / COUNT(DISTINCT b.id) AS avg_borrows_per_book,
    SUM(CASE 
        WHEN bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) 
        THEN 1 ELSE 0 
    END) AS recent_borrows,
    SUM(CASE 
        WHEN bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) 
        THEN 1 ELSE 0 
    END) AS old_borrows,
    CASE 
        WHEN SUM(CASE WHEN bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) > 
             SUM(CASE WHEN bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) * 1.2 
        THEN 'increasing'
        WHEN SUM(CASE WHEN bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) < 
             SUM(CASE WHEN bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) * 0.8 
        THEN 'decreasing'
        ELSE 'stable'
    END AS trend_direction
FROM books b
LEFT JOIN borrow_history bh ON b.id = bh.book_id
GROUP BY b.genre
ORDER BY total_borrows DESC;

-- View: Time Series Data (Last 30 Days)
CREATE OR REPLACE VIEW vw_time_series_30days AS
WITH RECURSIVE dates AS (
    SELECT DATE_SUB(CURDATE(), INTERVAL 29 DAY) AS date
    UNION ALL
    SELECT DATE_ADD(date, INTERVAL 1 DAY)
    FROM dates
    WHERE date < CURDATE()
)
SELECT 
    d.date,
    COUNT(DISTINCT CASE WHEN DATE(bh.borrow_date) = d.date THEN bh.id END) AS borrows,
    COUNT(DISTINCT CASE WHEN DATE(bh.return_date) = d.date THEN bh.id END) AS returns,
    COUNT(DISTINCT CASE WHEN DATE(bh.borrow_date) = d.date THEN bh.user_id END) AS active_users
FROM dates d
LEFT JOIN borrow_history bh ON DATE(bh.borrow_date) = d.date OR DATE(bh.return_date) = d.date
GROUP BY d.date
ORDER BY d.date;

-- Stored Procedure: Get User Category Preferences
DELIMITER //
CREATE PROCEDURE sp_get_user_category_preferences(IN p_user_id INT)
BEGIN
    SELECT 
        b.genre AS category,
        COUNT(bh.id) AS borrow_count,
        (COUNT(bh.id) * 100.0 / (SELECT COUNT(*) FROM borrow_history WHERE user_id = p_user_id)) AS percentage
    FROM borrow_history bh
    JOIN books b ON bh.book_id = b.id
    WHERE bh.user_id = p_user_id
    GROUP BY b.genre
    ORDER BY borrow_count DESC;
END //
DELIMITER ;

-- Stored Procedure: Get User Favorite Authors
DELIMITER //
CREATE PROCEDURE sp_get_user_favorite_authors(IN p_user_id INT)
BEGIN
    SELECT 
        b.author,
        COUNT(bh.id) AS borrow_count
    FROM borrow_history bh
    JOIN books b ON bh.book_id = b.id
    WHERE bh.user_id = p_user_id
    GROUP BY b.author
    ORDER BY borrow_count DESC
    LIMIT 5;
END //
DELIMITER ;

-- Stored Procedure: Get Overall Library Statistics
DELIMITER //
CREATE PROCEDURE sp_get_overall_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM books) AS total_books,
        (SELECT SUM(available_copies) FROM books) AS available_books,
        (SELECT SUM(total_copies - available_copies) FROM books) AS borrowed_books,
        (SELECT COUNT(*) FROM borrow_history) AS total_borrows,
        (SELECT COUNT(DISTINCT user_id) FROM borrow_history) AS active_users,
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT AVG(DATEDIFF(return_date, borrow_date)) 
         FROM borrow_history 
         WHERE return_date IS NOT NULL) AS avg_borrow_duration,
        ((SELECT SUM(total_copies - available_copies) FROM books) * 100.0 / 
         (SELECT SUM(total_copies) FROM books)) AS utilization_rate;
END //
DELIMITER ;
