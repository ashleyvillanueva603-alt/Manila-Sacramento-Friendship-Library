<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Call stored procedure to get overall statistics
    $query = "CALL sp_get_overall_stats()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($stats) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "totalBooks" => (int)$stats['total_books'],
                "availableBooks" => (int)$stats['available_books'],
                "borrowedBooks" => (int)$stats['borrowed_books'],
                "totalBorrows" => (int)$stats['total_borrows'],
                "activeUsers" => (int)$stats['active_users'],
                "totalUsers" => (int)$stats['total_users'],
                "averageBorrowDuration" => (float)$stats['avg_borrow_duration'],
                "utilizationRate" => (float)$stats['utilization_rate']
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Unable to retrieve statistics"
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
