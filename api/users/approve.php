<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->librarian_id) && !empty($data->action)) {
    $user->id = $data->user_id;
    
    if ($data->action === 'approve') {
        if ($user->approve($data->librarian_id)) {
            http_response_code(200);
            echo json_encode(array("message" => "User approved successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to approve user"));
        }
    } elseif ($data->action === 'reject') {
        $reason = $data->reason ?? 'No reason provided';
        if ($user->reject($data->librarian_id, $reason)) {
            http_response_code(200);
            echo json_encode(array("message" => "User rejected successfully"));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Unable to reject user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
