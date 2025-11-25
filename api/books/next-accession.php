<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT accession_number FROM books 
              WHERE accession_number IS NOT NULL 
              AND accession_number != '' 
              AND accession_number REGEXP '^[0-9]+'
              ORDER BY CAST(SUBSTRING_INDEX(accession_number, ' ', 1) AS UNSIGNED) DESC 
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && $result['accession_number']) {
        $lastAccession = $result['accession_number'];
        
        // Extract the numeric part (e.g., "14538 M4" -> 14538)
        preg_match('/(\d+)/', $lastAccession, $matches);
        
        if (isset($matches[1])) {
            $lastNumber = intval($matches[1]);
            $nextNumber = $lastNumber + 1;
            
            // Extract the suffix (e.g., "14538 M4" -> "M4")
            preg_match('/\s+([A-Z0-9]+)$/', $lastAccession, $suffixMatches);
            $suffix = isset($suffixMatches[1]) ? ' ' . $suffixMatches[1] : ' M4';
            
            $nextAccession = $nextNumber . $suffix;
        } else {
            // Default if pattern doesn't match
            $nextAccession = "10000 M4";
        }
    } else {
        // No accession numbers exist yet, start with default
        $nextAccession = "10000 M4";
    }
    
    http_response_code(200);
    echo json_encode(array(
        "success" => true,
        "next_accession_number" => $nextAccession,
        "last_accession_number" => isset($lastAccession) ? $lastAccession : null
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ));
}
?>
