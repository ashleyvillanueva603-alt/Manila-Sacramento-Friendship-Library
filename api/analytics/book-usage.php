<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get limit parameter (default 10)
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

try {
    $query = "SELECT 
                b.id AS book_id,
                b.title,
                b.author,
                b.genre AS category,
                COUNT(CASE WHEN br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL) THEN 1 END) AS total_borrows,
                COUNT(DISTINCT CASE WHEN br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL) THEN br.user_id END) AS unique_borrowers,
                COALESCE(AVG(CASE WHEN br.return_date IS NOT NULL THEN DATEDIFF(br.return_date, br.borrow_date) END), 0) AS avg_borrow_duration,
                MAX(CASE WHEN br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL) THEN br.borrow_date END) AS last_borrowed,
                (COUNT(CASE WHEN br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL) THEN 1 END) * 0.6 + 
                 COUNT(DISTINCT CASE WHEN br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL) THEN br.user_id END) * 0.4) AS popularity_score
              FROM books b
              LEFT JOIN borrow_records br ON b.id = br.book_id
              WHERE b.deleted_at IS NULL
              GROUP BY b.id, b.title, b.author, b.genre
              HAVING total_borrows > 0
              ORDER BY popularity_score DESC, total_borrows DESC
              LIMIT :limit";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    $formattedBooks = array_map(function($book) {
        return [
            "bookId" => (int)$book['book_id'],
            "title" => $book['title'],
            "author" => $book['author'],
            "category" => $book['category'],
            "totalBorrows" => (int)$book['total_borrows'],
            "uniqueBorrowers" => (int)$book['unique_borrowers'],
            "averageBorrowDuration" => (float)$book['avg_borrow_duration'],
            "lastBorrowed" => $book['last_borrowed'],
            "popularityScore" => (float)$book['popularity_score']
        ];
    }, $books);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $formattedBooks
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
