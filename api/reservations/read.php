<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : 'active';

try {
    $query = "SELECT r.id as id,
              r.user_id,
              r.book_id,
              r.reservation_date,
              r.status,
              r.approval_status,
              r.approved_by,
              r.approved_at,
              r.rejection_reason,
              r.fulfilled_at,
              b.title as book_title, 
              b.author as book_author, 
              b.cover_url as book_cover, 
              b.available_copies,
              u.name as user_name,
              u.email as user_email,
              u.student_id
              FROM reservations r
              JOIN books b ON r.book_id = b.id
              JOIN users u ON r.user_id = u.id
              WHERE 1=1";
    
    if ($user_id) {
        $query .= " AND r.user_id = :user_id";
    }
    
    if ($status) {
        $query .= " AND r.status = :status";
    }
    
    $query .= " ORDER BY r.reservation_date DESC";
    
    $stmt = $db->prepare($query);
    
    if ($user_id) {
        $stmt->bindParam(':user_id', $user_id);
    }
    
    if ($status) {
        $stmt->bindParam(':status', $status);
    }
    
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
        "message" => "Server error: " . $e->getMessage()
    ));
}
?>
