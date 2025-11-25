<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
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
$book = new Book($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $book->id = $data->id;
    
    // Set book properties
    $book->title = $data->title ?? null;
    $book->author = $data->author ?? null;
    $book->isbn = $data->isbn ?? null;
    $book->genre = $data->genre ?? null;
    $book->description = $data->description ?? null;
    $book->published_year = $data->published_year ?? null;
    $book->total_copies = $data->total_copies ?? null;
    $book->available_copies = $data->available_copies ?? null;
    $book->cover_url = $data->cover_url ?? null;
    $book->publisher = $data->publisher ?? null;
    $book->page_count = $data->page_count ?? null;
    $book->language = $data->language ?? null;
    $book->categories = isset($data->categories) ? json_encode($data->categories) : null;

    if ($book->update()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Book updated successfully"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to update book"
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
