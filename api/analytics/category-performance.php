<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                b.genre AS category,
                COUNT(DISTINCT b.id) AS total_books,
                COUNT(CASE 
                    WHEN bh.approval_status IN ('approved', 'returned') 
                    OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL) 
                    THEN bh.id 
                END) AS total_borrows,
                COALESCE(COUNT(CASE 
                    WHEN bh.approval_status IN ('approved', 'returned') 
                    OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL) 
                    THEN bh.id 
                END) / NULLIF(COUNT(DISTINCT b.id), 0), 0) AS avg_borrows_per_book,
                SUM(CASE 
                    WHEN (bh.approval_status IN ('approved', 'returned') 
                    OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL))
                    AND bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) 
                    THEN 1 ELSE 0 
                END) AS recent_borrows,
                SUM(CASE 
                    WHEN (bh.approval_status IN ('approved', 'returned') 
                    OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL))
                    AND bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) 
                    THEN 1 ELSE 0 
                END) AS old_borrows,
                CASE 
                    WHEN SUM(CASE WHEN (bh.approval_status IN ('approved', 'returned') OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL)) AND bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) > 
                         SUM(CASE WHEN (bh.approval_status IN ('approved', 'returned') OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL)) AND bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) * 1.2 
                    THEN 'increasing'
                    WHEN SUM(CASE WHEN (bh.approval_status IN ('approved', 'returned') OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL)) AND bh.borrow_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) < 
                         SUM(CASE WHEN (bh.approval_status IN ('approved', 'returned') OR (bh.approval_status IS NULL AND bh.return_date IS NOT NULL)) AND bh.borrow_date < DATE_SUB(NOW(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) * 0.8 
                    THEN 'decreasing'
                    ELSE 'stable'
                END AS trend_direction
              FROM books b
              LEFT JOIN borrow_records bh ON b.id = bh.book_id
              WHERE b.deleted_at IS NULL
              GROUP BY b.genre
              HAVING total_borrows > 0
              ORDER BY total_borrows DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate percentages
    $totalBorrows = array_sum(array_column($categories, 'total_borrows'));
    
    $formattedCategories = array_map(function($category, $index) use ($totalBorrows) {
        return [
            "category" => $category['category'],
            "totalBooks" => (int)$category['total_books'],
            "totalBorrows" => (int)$category['total_borrows'],
            "averageBorrowsPerBook" => (float)$category['avg_borrows_per_book'],
            "popularityRank" => $index + 1,
            "trendDirection" => $category['trend_direction'],
            "percentage" => $totalBorrows > 0 ? round(($category['total_borrows'] / $totalBorrows) * 100, 1) : 0
        ];
    }, $categories, array_keys($categories));
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $formattedCategories
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
