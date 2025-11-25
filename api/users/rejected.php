<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

// Query for rejected users
$query = "SELECT 
    id,
    email,
    name,
    role,
    student_id,
    phone_number,
    address,
    education_level,
    school,
    professional_category,
    approval_status,
    rejection_reason,
    created_at
FROM " . $user->table_name . "
WHERE approval_status = 'rejected'
ORDER BY created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

if ($num > 0) {
    $users_arr = array();
    $users_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = array(
            "id" => $id,
            "email" => $email,
            "name" => $name,
            "role" => $role,
            "student_id" => $student_id,
            "phone_number" => $phone_number,
            "address" => $address,
            "education_level" => $education_level,
            "school" => $school,
            "professional_category" => $professional_category,
            "approval_status" => $approval_status,
            "rejection_reason" => $rejection_reason,
            "created_at" => $created_at
        );
        array_push($users_arr["records"], $user_item);
    }

    http_response_code(200);
    echo json_encode($users_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => array()));
}
?>
