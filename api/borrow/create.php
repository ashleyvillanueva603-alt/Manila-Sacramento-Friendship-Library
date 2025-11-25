<?php
include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->book_id)) {
    try {
        $db->beginTransaction();

        // Check if book is available
        $book = new Book($db);
        $book->id = $data->book_id;
        
        if ($book->read_single() && $book->available_copies > 0) {
            $due_date = date('Y-m-d H:i:s', strtotime('+14 days'));
            
            $query = "INSERT INTO borrow_records (user_id, book_id, due_date, status, approval_status) VALUES (?, ?, ?, 'pending', 'pending')";
            $stmt = $db->prepare($query);
            $stmt->execute([$data->user_id, $data->book_id, $due_date]);

            // $book->updateAvailableCopies(-1);

            $db->commit();

            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Borrow request submitted successfully. Awaiting librarian approval.",
                "due_date" => $due_date
            ));
        } else {
            $db->rollback();
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Book not available"
            ));
        }
    } catch (Exception $e) {
        $db->rollback();
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to create borrow request: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "User ID and Book ID are required"
    ));
}
?>
