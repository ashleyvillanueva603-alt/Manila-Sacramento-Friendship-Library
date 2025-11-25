<?php
include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();
$book = new Book($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->author) && !empty($data->genre)) {
    $book->title = $data->title;
    $book->author = $data->author;
    $book->isbn = $data->isbn ?? null;
    $book->genre = $data->genre;
    $book->description = $data->description ?? null;
    $book->published_year = $data->published_year ?? null;
    $book->total_copies = $data->total_copies ?? 1;
    $book->available_copies = $data->available_copies ?? $book->total_copies;
    $book->cover_url = $data->cover_url ?? null;
    $book->google_books_id = $data->google_books_id ?? null;
    $book->publisher = $data->publisher ?? null;
    $book->page_count = $data->page_count ?? null;
    $book->language = $data->language ?? 'en';
    $book->categories = json_encode($data->categories ?? []);

    if ($book->create()) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "Book created successfully"
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to create book"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: title, author, genre"
    ));
}
?>
