<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
    // Check if getting single user by ID
    if (isset($_GET['id'])) {
        $user->id = intval($_GET['id']);
        $result = $user->read_single();
        
        if ($result) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => (int)$user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "role" => $user->role,
                    "isActive" => (bool)$user->is_active,
                    "approval_status" => $user->approval_status,
                    "approved" => ($user->approval_status === 'approved' ? 1 : 0),
                    "createdAt" => $user->created_at
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "User not found"
            ]);
        }
    } else {
        // Get all users with pagination
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
        
        $stmt = $user->read($limit, $offset);
        $users = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                "id" => (int)$row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role'],
                "isActive" => (bool)$row['is_active'],
                "approval_status" => $row['approval_status'],
                "approved" => ($row['approval_status'] === 'approved' ? 1 : 0),
                "createdAt" => $row['created_at']
            ];
        }
        
        echo json_encode([
            "success" => true,
            "records" => $users,
            "count" => count($users)
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error reading users: " . $e->getMessage()
    ]);
}
?>
