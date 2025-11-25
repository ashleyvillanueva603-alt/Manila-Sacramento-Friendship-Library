<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->book_id)) {
    try {
        $query = "UPDATE reservations SET status = 'cancelled' WHERE user_id = ? AND book_id = ? AND status IN ('active', 'fulfilled')";
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $data->user_id);
        $stmt->bindParam(2, $data->book_id);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Reservation cancelled successfully"
            ));
        } else {
            http_response_code(404);
            echo json_encode(array(
                "success" => false,
                "message" => "Reservation not found or already cancelled"
            ));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Server error: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: user_id, book_id"
    ));
}
?>
