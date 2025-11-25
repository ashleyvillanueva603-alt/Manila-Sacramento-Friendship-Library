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

if (empty($data->user_id) || empty($data->book_id) || empty($data->librarian_id)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: user_id, book_id, librarian_id"
    ));
    exit();
}

try {
    $db->beginTransaction();

    $reservationQuery = "
        SELECT r.*, u.id as user_id, b.id as book_id
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN books b ON r.book_id = b.id
        WHERE r.user_id = ? AND r.book_id = ? AND r.status = 'fulfilled'
    ";
    
    $reservationStmt = $db->prepare($reservationQuery);
    $reservationStmt->bindParam(1, $data->user_id);
    $reservationStmt->bindParam(2, $data->book_id);
    $reservationStmt->execute();
    $reservation = $reservationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        $db->rollback();
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Fulfilled reservation not found"
        ));
        exit();
    }

    // Calculate due date (14 days from now)
    $due_date = date('Y-m-d H:i:s', strtotime('+14 days'));

    $borrowQuery = "
        INSERT INTO borrow_records (
            user_id, book_id, due_date, status, approval_status, approved_by, approved_at
        ) VALUES (?, ?, ?, 'borrowed', 'approved', ?, NOW())
    ";
    
    $borrowStmt = $db->prepare($borrowQuery);
    $borrowStmt->execute([
        $reservation['user_id'],
        $reservation['book_id'],
        $due_date,
        $data->librarian_id
    ]);

    $borrow_id = $db->lastInsertId();

    // Update book available copies
    $book = new Book($db);
    $book->id = $reservation['book_id'];
    if ($book->read_single()) {
        $book->updateAvailableCopies(-1);
    }

    $approveQuery = "
        UPDATE reservations
        SET approval_status = 'approved',
            approved_by = ?,
            approved_at = NOW()
        WHERE user_id = ? AND book_id = ?
    ";
    
    $approveStmt = $db->prepare($approveQuery);
    $approveStmt->execute([$data->librarian_id, $data->user_id, $data->book_id]);

    $db->commit();

    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "message" => "Reservation approved and book moved to borrower's My Books.",
        "borrow_record_id" => $borrow_id,
        "due_date" => $due_date
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
