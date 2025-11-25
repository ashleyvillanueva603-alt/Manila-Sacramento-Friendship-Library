<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

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
    $query = "
        UPDATE reservations
        SET status = 'active',
            approval_status = 'rejected',
            approved_by = ?,
            approved_at = NOW(),
            rejection_reason = ?,
            fulfilled_at = NULL
        WHERE user_id = ? AND book_id = ? AND status = 'fulfilled'
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data->librarian_id,
        $data->reason ?? 'Rejected by librarian',
        $data->user_id,
        $data->book_id
    ]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Reservation returned to active status and will be offered to next user."
        ));
    } else {
        http_response_code(404);
        echo json_encode(array(
            "success" => false,
            "message" => "Fulfilled reservation not found"
        ));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ));
}
?>
