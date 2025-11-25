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

if (!isset($data->userId)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID is required"
    ]);
    exit();
}

$userId = $data->userId;
$limit = isset($data->limit) ? (int)$data->limit : 10;

try {
    $db->beginTransaction();
    
    // Update user preferences first
    $updateQuery = "CALL sp_update_user_preferences(:userId)";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':userId', $userId);
    $updateStmt->execute();
    
    // Get collaborative filtering recommendations
    $collabQuery = "CALL sp_get_collaborative_recommendations(:userId, :limit)";
    $collabStmt = $db->prepare($collabQuery);
    $collabStmt->bindParam(':userId', $userId);
    $collabStmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $collabStmt->execute();
    $collabRecommendations = $collabStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get content-based recommendations
    $contentQuery = "CALL sp_get_content_based_recommendations(:userId, :limit)";
    $contentStmt = $db->prepare($contentQuery);
    $contentStmt->bindParam(':userId', $userId);
    $contentStmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $contentStmt->execute();
    $contentRecommendations = $contentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Combine and score recommendations
    $recommendations = [];
    $bookScores = [];
    
    // Process collaborative recommendations
    foreach ($collabRecommendations as $rec) {
        $bookId = $rec['book_id'];
        if (!isset($bookScores[$bookId])) {
            $bookScores[$bookId] = [
                'book' => $rec,
                'collabScore' => (float)$rec['recommendation_score'],
                'contentScore' => 0,
                'reasons' => []
            ];
        }
        $bookScores[$bookId]['reasons'][] = "Users with similar reading preferences enjoyed this book";
    }
    
    // Process content-based recommendations
    foreach ($contentRecommendations as $rec) {
        $bookId = $rec['book_id'];
        if (!isset($bookScores[$bookId])) {
            $bookScores[$bookId] = [
                'book' => $rec,
                'collabScore' => 0,
                'contentScore' => (float)$rec['recommendation_score'],
                'reasons' => []
            ];
        } else {
            $bookScores[$bookId]['contentScore'] = (float)$rec['recommendation_score'];
        }
        $bookScores[$bookId]['reasons'][] = "Matches your reading interests";
    }
    
    // Calculate final scores and format recommendations
    foreach ($bookScores as $bookId => $scoreData) {
        $finalScore = ($scoreData['collabScore'] * 0.6) + ($scoreData['contentScore'] * 0.4);
        $confidence = min(($scoreData['collabScore'] + $scoreData['contentScore']) / 2, 1.0);
        
        $recommendations[] = [
            'bookId' => $bookId,
            'title' => $scoreData['book']['title'],
            'author' => $scoreData['book']['author'],
            'category' => $scoreData['book']['category'],
            'recommendationScore' => $finalScore,
            'recommendationReasons' => array_unique($scoreData['reasons']),
            'confidence' => $confidence
        ];
    }
    
    // Sort by recommendation score
    usort($recommendations, function($a, $b) {
        return $b['recommendationScore'] <=> $a['recommendationScore'];
    });
    
    // Limit results
    $recommendations = array_slice($recommendations, 0, $limit);
    
    // Cache recommendations in database
    $cacheQuery = "INSERT INTO book_recommendations 
                   (id, user_id, book_id, recommendation_score, recommendation_reasons, confidence)
                   VALUES (UUID(), :userId, :bookId, :score, :reasons, :confidence)
                   ON DUPLICATE KEY UPDATE 
                   recommendation_score = VALUES(recommendation_score),
                   recommendation_reasons = VALUES(recommendation_reasons),
                   confidence = VALUES(confidence),
                   generated_at = CURRENT_TIMESTAMP";
    
    $cacheStmt = $db->prepare($cacheQuery);
    
    foreach ($recommendations as $rec) {
        $cacheStmt->execute([
            ':userId' => $userId,
            ':bookId' => $rec['bookId'],
            ':score' => $rec['recommendationScore'],
            ':reasons' => json_encode($rec['recommendationReasons']),
            ':confidence' => $rec['confidence']
        ]);
    }
    
    $db->commit();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $recommendations
    ]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
