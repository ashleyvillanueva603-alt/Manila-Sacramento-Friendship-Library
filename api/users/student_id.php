<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/User.php';

// Initialize database and user object
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// ✅ Call function to get next student ID (with prefix)
$nextStudentId = $user->getNextStudentId('S');

// ✅ Return as JSON response
echo json_encode([
    "success" => true,
    "next_student_id" => $nextStudentId
]);
?>
