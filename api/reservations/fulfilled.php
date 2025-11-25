<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

/**
 * Get fulfilled reservations pending librarian approval
 * Can filter by librarian view (all) or user view (their reservations)
 */

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

try {
    $query = "
        SELECT 
            r.id,
            r.user_id,
            r.book_id,
            r.status,
            r.approval_status,
            r.fulfilled_at,
            b.title as book_title,
            b.author as book_author,
            b.cover_url as book_cover,
            u.name as user_name,
            u.email as user_email,
            u.student_id,
            r.reservation_date
        FROM reservations r
        JOIN books b ON r.book_id = b.id
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'fulfilled' AND r.approval_status = 'pending'
    ";
    
    if ($user_id) {
        $query .= " AND r.user_id = :user_id";
    }
    
    $query .= " ORDER BY r.fulfilled_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    
    if ($user_id) {
        $stmt->bindParam(':user_id', $user_id);
    }
    
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "records" => $reservations,
        "total" => count($reservations)
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ));
}
?>
