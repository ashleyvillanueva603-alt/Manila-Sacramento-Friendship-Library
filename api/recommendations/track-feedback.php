<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->userId) || !isset($data->bookId) || !isset($data->feedbackType)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID, Book ID, and Feedback Type are required"
    ]);
    exit();
}

$userId = $data->userId;
$bookId = $data->bookId;
$feedbackType = $data->feedbackType; // 'viewed', 'borrowed', 'ignored', 'liked', 'disliked'

try {
    // Update recommendation record
    $updateQuery = "UPDATE book_recommendations 
                    SET is_viewed = CASE WHEN :feedbackType IN ('viewed', 'borrowed', 'liked') THEN TRUE ELSE is_viewed END,
                        is_borrowed = CASE WHEN :feedbackType = 'borrowed' THEN TRUE ELSE is_borrowed END
                    WHERE user_id = :userId AND book_id = :bookId";
    
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':userId', $userId);
    $updateStmt->bindParam(':bookId', $bookId);
    $updateStmt->bindParam(':feedbackType', $feedbackType);
    $updateStmt->execute();
    
    // Get recommendation ID
    $recQuery = "SELECT id FROM book_recommendations WHERE user_id = :userId AND book_id = :bookId LIMIT 1";
    $recStmt = $db->prepare($recQuery);
    $recStmt->bindParam(':userId', $userId);
    $recStmt->bindParam(':bookId', $bookId);
    $recStmt->execute();
    $recommendation = $recStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($recommendation) {
        // Insert feedback record
        $feedbackQuery = "INSERT INTO recommendation_feedback 
                         (id, recommendation_id, user_id, book_id, feedback_type)
                         VALUES (UUID(), :recId, :userId, :bookId, :feedbackType)";
        
        $feedbackStmt = $db->prepare($feedbackQuery);
        $feedbackStmt->bindParam(':recId', $recommendation['id']);
        $feedbackStmt->bindParam(':userId', $userId);
        $feedbackStmt->bindParam(':bookId', $bookId);
        $feedbackStmt->bindParam(':feedbackType', $feedbackType);
        $feedbackStmt->execute();
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Feedback recorded successfully"
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
