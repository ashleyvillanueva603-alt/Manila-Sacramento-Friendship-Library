<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database connection failed"
    ));
    exit();
}

$book = new Book($db);

// Get the posted data
$data = json_decode(file_get_contents("php://input"));

// Check if ID is provided
if (!empty($data->id)) {
    $book->id = $data->id;

    // Soft delete the book (sets deleted_at timestamp)
    if ($book->softDelete()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Book deleted successfully"
        ));
    } else {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Book not found or already deleted"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Book ID is required"
    ));
}
?>
