<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->book_title) && !empty($data->reason)) {
    $query = "INSERT INTO book_requests (user_id, book_title, author, isbn, reason) 
              VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->user_id,
        $data->book_title,
        $data->author ?? null,
        $data->isbn ?? null,
        $data->reason
    ])) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "Book request submitted successfully"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to submit book request"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: user_id, book_title, reason"
    ));
}
?>
