<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get book ID parameter
$bookId = isset($_GET['bookId']) ? $_GET['bookId'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;

if (!$bookId) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Book ID is required"
    ]);
    exit();
}

try {
    // Get the target book details
    $bookQuery = "SELECT id, title, author, category FROM books WHERE id = :bookId";
    $bookStmt = $db->prepare($bookQuery);
    $bookStmt->bindParam(':bookId', $bookId);
    $bookStmt->execute();
    $targetBook = $bookStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$targetBook) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Book not found"
        ]);
        exit();
    }
    
    // Find similar books
    $query = "SELECT 
                b.id,
                b.title,
                b.author,
                b.category,
                b.cover_image,
                CASE 
                    WHEN b.author = :author THEN 0.6
                    ELSE 0
                END +
                CASE 
                    WHEN b.category = :category THEN 0.4
                    ELSE 0
                END AS similarity_score
              FROM books b
              WHERE b.id != :bookId
                AND b.status = 'available'
                AND (b.author = :author OR b.category = :category)
              ORDER BY similarity_score DESC, b.title
              LIMIT :limit";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':bookId', $bookId);
    $stmt->bindParam(':author', $targetBook['author']);
    $stmt->bindParam(':category', $targetBook['category']);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $similarBooks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $recommendations = array_map(function($book) use ($targetBook) {
        $reasons = [];
        if ($book['author'] === $targetBook['author']) {
            $reasons[] = "By the same author: " . $book['author'];
        }
        if ($book['category'] === $targetBook['category']) {
            $reasons[] = "Similar category: " . $book['category'];
        }
        
        return [
            'bookId' => $book['id'],
            'title' => $book['title'],
            'author' => $book['author'],
            'category' => $book['category'],
            'coverImage' => $book['cover_image'],
            'recommendationScore' => (float)$book['similarity_score'],
            'recommendationReasons' => $reasons,
            'confidence' => 0.85
        ];
    }, $similarBooks);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $recommendations
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
