<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Book.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->borrow_id) && !empty($data->librarian_id) && !empty($data->action)) {
    
    if ($data->action === 'approve') {
        try {
            $db->beginTransaction();
            
            // Get the book_id from the borrow record
            $getBorrowQuery = "SELECT book_id FROM borrow_records WHERE id = :borrow_id";
            $getBorrowStmt = $db->prepare($getBorrowQuery);
            $getBorrowStmt->bindParam(':borrow_id', $data->borrow_id);
            $getBorrowStmt->execute();
            $borrowRecord = $getBorrowStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$borrowRecord) {
                throw new Exception("Borrow record not found");
            }
            
            // Update approval status
            $query = "UPDATE borrow_records 
                      SET approval_status = 'approved',
                          approved_by = :librarian_id,
                          approved_at = NOW(),
                          status = 'borrowed'
                      WHERE id = :borrow_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':borrow_id', $data->borrow_id);
            $stmt->bindParam(':librarian_id', $data->librarian_id);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to update approval status");
            }
            
            // Decrement available copies
            $book = new Book($db);
            $book->id = $borrowRecord['book_id'];
            if (!$book->updateAvailableCopies(-1)) {
                throw new Exception("Failed to update book availability");
            }
            
            $db->commit();
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Borrow request approved successfully"
            ));
        } catch (Exception $e) {
            $db->rollback();
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to approve borrow request: " . $e->getMessage()
            ));
        }
    } else if ($data->action === 'reject') {
        $query = "UPDATE borrow_records 
                  SET approval_status = 'rejected',
                      approved_by = :librarian_id,
                      approved_at = NOW(),
                      status = 'rejected',
                      rejection_reason = :reason
                  WHERE id = :borrow_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':borrow_id', $data->borrow_id);
        $stmt->bindParam(':librarian_id', $data->librarian_id);
        
        $reason = $data->reason ?? 'No reason provided';
        $stmt->bindParam(':reason', $reason);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Borrow request rejected successfully"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to reject borrow request"
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action"));
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
