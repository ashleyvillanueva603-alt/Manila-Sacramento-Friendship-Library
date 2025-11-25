<?php
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    $user->password = $data->password;

    if ($user->login()) {
        $user->read_single();
        
        if ($user->approval_status === 'pending') {
            http_response_code(403);
            echo json_encode(array(
                "success" => false,
                "message" => "Your account is pending librarian approval. Please wait for approval before logging in."
            ));
            exit;
        }

        if ($user->approval_status === 'rejected') {
            http_response_code(403);
            echo json_encode(array(
                "success" => false,
                "message" => "Your account registration was rejected. Please contact the librarian for more information."
            ));
            exit;
        }

        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful",
            "user" => array(
                "id" => $user->id,
                "email" => $user->email,
                "name" => $user->name,
                "role" => $user->role,
                "approval_status" => $user->approval_status,
                "approved" => ($user->approval_status === 'approved' ? 1 : 0)
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid credentials"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Email and password are required"
    ));
}
?>
