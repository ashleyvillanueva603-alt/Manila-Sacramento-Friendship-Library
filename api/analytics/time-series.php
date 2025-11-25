<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get days parameter (default 30, max 365)
$days = isset($_GET['days']) ? min((int)$_GET['days'], 365) : 30;

try {
    $query = "WITH RECURSIVE dates AS (
                SELECT DATE_SUB(CURDATE(), INTERVAL :days DAY) AS date
                UNION ALL
                SELECT DATE_ADD(date, INTERVAL 1 DAY)
                FROM dates
                WHERE date < CURDATE()
              )
              SELECT 
                d.date,
                COUNT(DISTINCT CASE 
                    WHEN DATE(br.borrow_date) = d.date 
                    AND (br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL))
                    THEN br.id 
                END) AS borrows,
                COUNT(DISTINCT CASE 
                    WHEN DATE(br.return_date) = d.date 
                    AND (br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL))
                    THEN br.id 
                END) AS returns,
                COUNT(DISTINCT CASE 
                    WHEN DATE(br.borrow_date) = d.date 
                    AND (br.approval_status IN ('approved', 'returned') OR (br.approval_status IS NULL AND br.return_date IS NOT NULL))
                    THEN br.user_id 
                END) AS active_users
              FROM dates d
              LEFT JOIN borrow_records br ON DATE(br.borrow_date) = d.date OR DATE(br.return_date) = d.date
              GROUP BY d.date
              ORDER BY d.date";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':days', $days, PDO::PARAM_INT);
    $stmt->execute();
    
    $timeSeriesData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formattedData = array_map(function($data) {
        return [
            "date" => $data['date'],
            "borrows" => (int)$data['borrows'],
            "returns" => (int)$data['returns'],
            "activeUsers" => (int)$data['active_users']
        ];
    }, $timeSeriesData);
    
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
