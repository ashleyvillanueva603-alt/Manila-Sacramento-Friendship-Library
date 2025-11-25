<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = $_GET['user_id'] ?? null;
$status = $_GET['status'] ?? null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$query = "SELECT br.*, u.name as user_name, u.email as user_email 
          FROM book_requests br 
          JOIN users u ON br.user_id = u.id 
          WHERE 1=1";

if ($user_id) {
    $query .= " AND br.user_id = :user_id";
}

if ($status) {
    $query .= " AND br.status = :status";
}

$query .= " ORDER BY br.request_date DESC LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);

if ($user_id) {
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
}

if ($status) {
    $stmt->bindParam(':status', $status);
}

$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$num = $stmt->rowCount();

$requests_arr = array();
$requests_arr["records"] = array();

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $request_item = array(
            "id" => $row['id'],
            "user_id" => $row['user_id'],
            "user_name" => $row['user_name'],
            "user_email" => $row['user_email'],
            "book_title" => $row['book_title'],
            "author" => $row['author'],
            "isbn" => $row['isbn'],
            "reason" => $row['reason'],
            "status" => $row['status'],
            "request_date" => $row['request_date'],
            "response_date" => $row['response_date'],
            "librarian_notes" => $row['librarian_notes']
        );

        array_push($requests_arr["records"], $request_item);
    }
}

http_response_code(200);
echo json_encode($requests_arr);
?>
