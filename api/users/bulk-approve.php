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

if (!empty($data->user_ids) && is_array($data->user_ids) && !empty($data->librarian_id) && !empty($data->action)) {
    
    // Start transaction for atomic operation
    $db->beginTransaction();
    
    try {
        $successCount = 0;
        $failedIds = array();
        
        foreach ($data->user_ids as $userId) {
            $user->id = $userId;
            
            if ($data->action === 'approve') {
                if ($user->approve($data->librarian_id)) {
                    $successCount++;
                } else {
                    $failedIds[] = $userId;
                }
            } elseif ($data->action === 'reject') {
                $reason = $data->reason ?? 'No reason provided';
                if ($user->reject($data->librarian_id, $reason)) {
                    $successCount++;
                } else {
                    $failedIds[] = $userId;
                }
            }
        }
        
        // If any operations failed, rollback
        if (count($failedIds) > 0) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(array(
                "message" => "Some users could not be processed",
                "success_count" => 0,
                "failed_ids" => $failedIds
            ));
        } else {
            // All succeeded, commit transaction
            $db->commit();
            http_response_code(200);
            echo json_encode(array(
                "message" => "All users processed successfully",
                "success_count" => $successCount,
                "total" => count($data->user_ids)
            ));
        }
        
    } catch (Exception $e) {
        // Rollback on any error
        $db->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Transaction failed: " . $e->getMessage()));
    }
    
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data or invalid user_ids array"));
}
?>
