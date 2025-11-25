<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

/**
 * Automatically fulfill active reservations when a book becomes available
 * Called when a book is returned or new copies are added
 */

try {
    $book_id = isset($_GET['book_id']) ? $_GET['book_id'] : null;
    
    if (!$book_id) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "book_id parameter is required"
        ));
        exit();
    }

    $db->beginTransaction();

    // Check if book has available copies
    $checkQuery = "SELECT available_copies FROM books WHERE id = ? AND deleted_at IS NULL";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(1, $book_id);
    $checkStmt->execute();
    $book = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$book || $book['available_copies'] <= 0) {
        $db->rollback();
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Book has no available copies"
        ));
        exit();
    }

    // Get the first active reservation for this book (FIFO - first come, first served)
    $getReservationQuery = "
        SELECT r.id, r.user_id 
        FROM reservations r
        WHERE r.book_id = ? 
        AND r.status = 'active' 
        AND r.approval_status = 'pending'
        ORDER BY r.reservation_date ASC 
        LIMIT 1
    ";
    
    $reservationStmt = $db->prepare($getReservationQuery);
    $reservationStmt->bindParam(1, $book_id);
    $reservationStmt->execute();
    $reservation = $reservationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        $db->rollback();
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "No active reservations found for this book"
        ));
        exit();
    }

    // Update reservation status to fulfilled
    $updateQuery = "
        UPDATE reservations 
        SET status = 'fulfilled', 
            fulfilled_at = NOW(),
            approval_status = 'pending'
        WHERE id = ?
    ";
    
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(1, $reservation['id']);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update reservation status");
    }

    $db->commit();

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "Reservation marked as fulfilled. Awaiting librarian approval.",
        "reservation_id" => $reservation['id'],
        "user_id" => $reservation['user_id']
    ));

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollback();
    }
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ));
}
?>
