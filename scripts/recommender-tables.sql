-- Additional tables and procedures for the Recommender System

-- Table: User Preferences (learned from behavior)
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    preference_type ENUM('category', 'author', 'genre') NOT NULL,
    preference_value VARCHAR(255) NOT NULL,
    preference_score DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_type, preference_value),
    INDEX idx_user_preferences (user_id, preference_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Book Recommendations (cached recommendations)
CREATE TABLE IF NOT EXISTS book_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    book_id VARCHAR(36) NOT NULL,
    recommendation_score DECIMAL(5,2) NOT NULL,
    recommendation_reasons JSON,
    confidence DECIMAL(3,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_borrowed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_recommendations (user_id, recommendation_score DESC),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: Recommendation Feedback (track recommendation effectiveness)
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id VARCHAR(36) PRIMARY KEY,
    recommendation_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    book_id VARCHAR(36) NOT NULL,
    feedback_type ENUM('viewed', 'borrowed', 'ignored', 'liked', 'disliked') NOT NULL,
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES book_recommendations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_feedback_analysis (book_id, feedback_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stored Procedure: Update User Preferences based on borrow history
DELIMITER //
CREATE PROCEDURE sp_update_user_preferences(IN p_user_id VARCHAR(36))
BEGIN
    -- Update category preferences
    INSERT INTO user_preferences (id, user_id, preference_type, preference_value, preference_score)
    SELECT 
        UUID() AS id,
        p_user_id AS user_id,
        'category' AS preference_type,
        b.category AS preference_value,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM borrow_history WHERE user_id = p_user_id)) AS preference_score
    FROM borrow_history bh
    JOIN books b ON bh.book_id = b.id
    WHERE bh.user_id = p_user_id AND b.category IS NOT NULL
    GROUP BY b.category
    ON DUPLICATE KEY UPDATE 
        preference_score = VALUES(preference_score),
        last_updated = CURRENT_TIMESTAMP;

    -- Update author preferences
    INSERT INTO user_preferences (id, user_id, preference_type, preference_value, preference_score)
    SELECT 
        UUID() AS id,
        p_user_id AS user_id,
        'author' AS preference_type,
        b.author AS preference_value,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM borrow_history WHERE user_id = p_user_id)) AS preference_score
    FROM borrow_history bh
    JOIN books b ON bh.book_id = b.id
    WHERE bh.user_id = p_user_id
    GROUP BY b.author
    ON DUPLICATE KEY UPDATE 
        preference_score = VALUES(preference_score),
        last_updated = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Stored Procedure: Get Collaborative Filtering Recommendations
DELIMITER //
CREATE PROCEDURE sp_get_collaborative_recommendations(
    IN p_user_id VARCHAR(36),
    IN p_limit INT
)
BEGIN
    -- Find similar users based on common borrowed books
    WITH similar_users AS (
        SELECT 
            bh2.user_id,
            COUNT(DISTINCT bh2.book_id) AS common_books
        FROM borrow_history bh1
        JOIN borrow_history bh2 ON bh1.book_id = bh2.book_id AND bh2.user_id != p_user_id
        WHERE bh1.user_id = p_user_id
        GROUP BY bh2.user_id
        HAVING common_books >= 2
        ORDER BY common_books DESC
        LIMIT 20
    )
    -- Get books borrowed by similar users but not by target user
    SELECT 
        b.id AS book_id,
        b.title,
        b.author,
        b.category,
        COUNT(DISTINCT bh.user_id) AS similar_user_count,
        (COUNT(DISTINCT bh.user_id) * 1.0 / (SELECT COUNT(*) FROM similar_users)) AS recommendation_score
    FROM similar_users su
    JOIN borrow_history bh ON su.user_id = bh.user_id
    JOIN books b ON bh.book_id = b.id
    WHERE b.status = 'available'
        AND b.id NOT IN (SELECT book_id FROM borrow_history WHERE user_id = p_user_id)
    GROUP BY b.id, b.title, b.author, b.category
    ORDER BY recommendation_score DESC, similar_user_count DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- Stored Procedure: Get Content-Based Recommendations
DELIMITER //
CREATE PROCEDURE sp_get_content_based_recommendations(
    IN p_user_id VARCHAR(36),
    IN p_limit INT
)
BEGIN
    -- Get user's preferred categories and authors
    SELECT 
        b.id AS book_id,
        b.title,
        b.author,
        b.category,
        (
            COALESCE((SELECT preference_score FROM user_preferences 
                     WHERE user_id = p_user_id 
                     AND preference_type = 'category' 
                     AND preference_value = b.category), 0) * 0.6 +
            COALESCE((SELECT preference_score FROM user_preferences 
                     WHERE user_id = p_user_id 
                     AND preference_type = 'author' 
                     AND preference_value = b.author), 0) * 0.4
        ) AS recommendation_score
    FROM books b
    WHERE b.status = 'available'
        AND b.id NOT IN (SELECT book_id FROM borrow_history WHERE user_id = p_user_id)
        AND (
            b.category IN (SELECT preference_value FROM user_preferences 
                          WHERE user_id = p_user_id AND preference_type = 'category')
            OR b.author IN (SELECT preference_value FROM user_preferences 
                           WHERE user_id = p_user_id AND preference_type = 'author')
        )
    ORDER BY recommendation_score DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- Stored Procedure: Track Recommendation Effectiveness
DELIMITER //
CREATE PROCEDURE sp_track_recommendation_effectiveness()
BEGIN
    SELECT 
        DATE(generated_at) AS date,
        COUNT(*) AS total_recommendations,
        SUM(CASE WHEN is_viewed THEN 1 ELSE 0 END) AS viewed_count,
        SUM(CASE WHEN is_borrowed THEN 1 ELSE 0 END) AS borrowed_count,
        (SUM(CASE WHEN is_viewed THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS view_rate,
        (SUM(CASE WHEN is_borrowed THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS conversion_rate
    FROM book_recommendations
    WHERE generated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(generated_at)
    ORDER BY date DESC;
END //
DELIMITER ;
