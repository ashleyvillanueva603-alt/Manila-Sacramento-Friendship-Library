<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->book_id)) {
    try {
        // Check if book exists and is unavailable
        $bookQuery = "SELECT id, title, available_copies FROM books WHERE id = ? AND deleted_at IS NULL";
        $bookStmt = $db->prepare($bookQuery);
        $bookStmt->bindParam(1, $data->book_id);
        $bookStmt->execute();
        
        $book = $bookStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$book) {
            http_response_code(404);
            echo json_encode(array(
                "success" => false,
                "message" => "Book not found"
            ));
            exit();
        }
        
        // Check if user already has an active reservation for this book
        $checkQuery = "SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status = 'active'";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(1, $data->user_id);
        $checkStmt->bindParam(2, $data->book_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "You already have an active reservation for this book"
            ));
            exit();
        }
        
        // Create reservation
        $query = "INSERT INTO reservations (user_id, book_id, reservation_date, status) 
                  VALUES (?, ?, NOW(), 'active')";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $data->user_id);
        $stmt->bindParam(2, $data->book_id);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Book reserved successfully! You will be notified when it becomes available."
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to create reservation"
            ));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Server error: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: user_id, book_id"
    ));
}
?>
