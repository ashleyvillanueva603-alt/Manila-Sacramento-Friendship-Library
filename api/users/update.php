<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);
        exit();
    }
    
    $user->id = $data['id'];
    
    // Set properties if provided
    if (isset($data['name'])) $user->name = $data['name'];
    if (isset($data['email'])) $user->email = $data['email'];
    if (isset($data['role'])) $user->role = $data['role'];
    if (isset($data['isActive'])) $user->is_active = $data['isActive'] ? 1 : 0;
    
    if ($user->update()) {
        echo json_encode([
            "success" => true,
            "message" => "User updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to update user"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error updating user: " . $e->getMessage()
    ]);
}
?>
