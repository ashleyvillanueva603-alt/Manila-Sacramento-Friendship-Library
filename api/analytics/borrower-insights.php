<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Query the borrower preferences view
    $query = "SELECT 
                reading_pattern,
                COUNT(*) as count,
                AVG(total_borrows) as avg_borrows
              FROM vw_borrower_preferences
              GROUP BY reading_pattern
              ORDER BY FIELD(reading_pattern, 'frequent', 'moderate', 'occasional')";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $patterns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate percentages
    $totalUsers = array_sum(array_column($patterns, 'count'));
    
    $formattedPatterns = array_map(function($pattern) use ($totalUsers) {
        return [
            "pattern" => ucfirst($pattern['reading_pattern']) . " Readers",
            "count" => (int)$pattern['count'],
            "avgBorrows" => (float)$pattern['avg_borrows'],
            "percentage" => $totalUsers > 0 ? round(($pattern['count'] / $totalUsers) * 100, 0) : 0
        ];
    }, $patterns);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $formattedPatterns
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
