<?php
include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->borrow_id)) {
    try {
        $db->beginTransaction();

        // Get borrow record
        $query = "SELECT * FROM borrow_records WHERE id = ? AND status = 'borrowed'";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->borrow_id]);
        $borrow_record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($borrow_record) {
            // Update borrow record
            $return_date = date('Y-m-d H:i:s');
            $query = "UPDATE borrow_records SET return_date = ?, status = 'returned' WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$return_date, $data->borrow_id]);

            // Update available copies
            $book = new Book($db);
            $book->id = $borrow_record['book_id'];
            $book->updateAvailableCopies(1);

            $fulfillQuery = "
                UPDATE reservations 
                SET status = 'fulfilled', 
                    fulfilled_at = NOW(),
                    approval_status = 'pending'
                WHERE book_id = ? 
                AND status = 'active' 
                AND approval_status = 'pending'
                AND id = (
                    SELECT id FROM reservations 
                    WHERE book_id = ? 
                    AND status = 'active' 
                    AND approval_status = 'pending'
                    ORDER BY reservation_date ASC 
                    LIMIT 1
                )
            ";
            
            $fulfillStmt = $db->prepare($fulfillQuery);
            $fulfillStmt->execute([$borrow_record['book_id'], $borrow_record['book_id']]);

            $db->commit();

            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Book returned successfully"
            ));
        } else {
            $db->rollback();
            http_response_code(404);
            echo json_encode(array(
                "success" => false,
                "message" => "Borrow record not found"
            ));
        }
    } catch (Exception $e) {
        $db->rollback();
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to return book: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Borrow ID is required"
    ));
}
?>
