<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();
$book = new Book($db);

if (isset($_GET['id'])) {
    $book->id = $_GET['id'];
    
    if ($book->read_single()) {
        $book_item = array(
            "id" => $book->id,
            "title" => $book->title,
            "author" => $book->author,
            "isbn" => $book->isbn,
            "genre" => $book->genre,
            "description" => $book->description,
            "published_year" => $book->published_year,
            "total_copies" => $book->total_copies,
            "available_copies" => $book->available_copies,
            "cover_url" => $book->cover_url,
            "created_at" => $book->created_at,
            "google_books_id" => $book->google_books_id,
            "publisher" => $book->publisher,
            "page_count" => $book->page_count,
            "language" => $book->language,
            "categories" => json_decode($book->categories)
        );
        
        http_response_code(200);
        echo json_encode($book_item);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Book not found"));
    }
    exit;
}

// Get query parameters for listing books
$search = $_GET['search'] ?? '';
$genre = $_GET['genre'] ?? '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$total_count = $book->count($search, $genre);

$stmt = $book->read($search, $genre, $limit, $offset);
$num = $stmt->rowCount();

$books_arr = array();
$books_arr["records"] = array();
$books_arr["total"] = (int)$total_count;

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        
        $book_item = array(
            "id" => $id,
            "title" => $title,
            "author" => $author,
            "isbn" => $isbn,
            "accession_number" => $accession_number,
            "date_acquired" => $date_acquired ?? null,
            "call_no" => $call_no ?? null,
            "section" => $section ?? null,
            "genre" => $genre,
            "description" => $description,
            "published_year" => $published_year,
            "total_copies" => $total_copies,
            "available_copies" => $available_copies,
            "cover_url" => $cover_url,
            "created_at" => $created_at,
            "deleted_at" => $deleted_at,
            "google_books_id" => $google_books_id,
            "publisher" => $publisher,
            "page_count" => $page_count,
            "language" => $language,
            "categories" => json_decode($categories)
        );

        array_push($books_arr["records"], $book_item);
    }
}

http_response_code(200);
echo json_encode($books_arr);
?>
