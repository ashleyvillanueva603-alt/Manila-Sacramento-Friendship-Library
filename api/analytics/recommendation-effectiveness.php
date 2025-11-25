<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Call stored procedure to get recommendation effectiveness
    $query = "CALL sp_track_recommendation_effectiveness()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $effectiveness = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formattedData = array_map(function($data) {
        return [
            "date" => $data['date'],
            "total" => (int)$data['total_recommendations'],
            "viewed" => (int)$data['viewed_count'],
            "borrowed" => (int)$data['borrowed_count'],
            "viewRate" => (float)$data['view_rate'],
            "conversionRate" => (float)$data['conversion_rate']
        ];
    }, $effectiveness);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $formattedData
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
