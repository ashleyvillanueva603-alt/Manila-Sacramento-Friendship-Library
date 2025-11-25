<?php
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password) && !empty($data->name) && !empty($data->role)) {
    $user->email = $data->email;
    $user->password = $data->password;
    $user->name = $data->name;
    $user->role = $data->role;
    $user->phone_number = $data->phone_number ?? null;
    $user->address = $data->address ?? null;
    $user->school = $data->school ?? null;
    $user->education_level = $data->education_level ?? null;
    $user->professional_category = $data->professional_category ?? null;
    $user->age = $data->age ?? null;
    $user->sex = $data->sex ?? null;
    $user->birth_date = $data->birth_date ?? null;
    $user->library_card_number = $data->library_card_number ?? null;
    $user->approval_status = 'pending';

    if ($user->create()) {
        http_response_code(201);
        echo json_encode(array(
            "success" => true,
            "message" => "User registered successfully. Awaiting librarian approval."
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to register user"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Required fields: email, password, name, role"
    ));
}
?>
