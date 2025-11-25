<?php
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = $_GET['user_id'] ?? null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$query = "SELECT br.*, b.title, b.author, b.cover_url, u.name as user_name 
          FROM borrow_records br 
          JOIN books b ON br.book_id = b.id 
          JOIN users u ON br.user_id = u.id
          WHERE br.approval_status != 'pending'";

if ($user_id) {
    $query .= " AND br.user_id = :user_id";
}

$query .= " ORDER BY br.borrow_date DESC LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);

if ($user_id) {
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
}

$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$history_arr = array();
$history_arr["records"] = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $history_item = array(
        "id" => $row['id'],
        "user_id" => $row['user_id'],
        "user_name" => $row['user_name'],
        "book_id" => $row['book_id'],
        "book_title" => $row['title'],
        "book_author" => $row['author'],
        "book_cover" => $row['cover_url'],
        "borrow_date" => $row['borrow_date'],
        "due_date" => $row['due_date'],
        "return_date" => $row['return_date'],
        "status" => $row['status'],
        "renewal_count" => $row['renewal_count'],
        "fine_amount" => $row['fine_amount'],
        "fine_paid" => $row['fine_paid']
    );

    array_push($history_arr["records"], $history_item);
}

http_response_code(200);
echo json_encode($history_arr);
?>
