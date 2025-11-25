<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->status)) {
    $query = "UPDATE book_requests 
              SET status = ?, response_date = NOW(), librarian_notes = ? 
              WHERE id = ?";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->status,
        $data->librarian_notes ?? null,
        $data->id
    ])) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Book request updated successfully"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to update book request"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: id, status"
    ));
}
?>
