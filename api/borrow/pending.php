<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT 
            br.id,
            br.user_id,
            br.book_id,
            br.borrow_date,
            br.due_date,
            br.approval_status,
            br.created_at,
            u.name as user_name,
            u.email as user_email,
            b.title as book_title,
            b.author as book_author,
            b.cover_image as book_cover
          FROM borrow_records br
          JOIN users u ON br.user_id = u.id
          JOIN books b ON br.book_id = b.id
          WHERE br.approval_status = 'pending'
          ORDER BY br.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$pending_requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($pending_requests) {
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "records" => $pending_requests
    ));
} else {
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "records" => array()
    ));
}
?>
