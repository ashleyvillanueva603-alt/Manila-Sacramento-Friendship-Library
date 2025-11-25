<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->report_type) && !empty($data->date_from) && !empty($data->date_to) && !empty($data->generated_by)) {
    
    $report_data = array();
    
    // Descriptive statistics from database
    if ($data->report_type === 'descriptive' || $data->report_type === 'combined') {
        // Total books
        $query = "SELECT COUNT(*) as total FROM books WHERE deleted_at IS NULL";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $report_data['total_books'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Total users
        $query = "SELECT COUNT(*) as total FROM users WHERE role='student' AND is_active=1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $report_data['total_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Borrowing statistics
        $query = "SELECT 
                    COUNT(*) as total_borrows,
                    SUM(CASE WHEN status='borrowed' THEN 1 ELSE 0 END) as active_borrows,
                    SUM(CASE WHEN status='returned' THEN 1 ELSE 0 END) as returned_books,
                    SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) as overdue_books
                  FROM borrow_records 
                  WHERE borrow_date BETWEEN :date_from AND :date_to";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':date_from', $data->date_from);
        $stmt->bindParam(':date_to', $data->date_to);
        $stmt->execute();
        $borrow_stats = $stmt->fetch(PDO::FETCH_ASSOC);
        $report_data['borrow_statistics'] = $borrow_stats;
        
        // Popular books
        $query = "SELECT b.title, b.author, COUNT(br.id) as borrow_count
                  FROM books b
                  JOIN borrow_records br ON b.id = br.book_id
                  WHERE br.borrow_date BETWEEN :date_from AND :date_to
                  GROUP BY b.id
                  ORDER BY borrow_count DESC
                  LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':date_from', $data->date_from);
        $stmt->bindParam(':date_to', $data->date_to);
        $stmt->execute();
        $popular_books = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $report_data['popular_books'] = $popular_books;
        
        // Category performance
        $query = "SELECT b.genre as category, 
                         COUNT(DISTINCT b.id) as total_books,
                         COUNT(br.id) as total_borrows
                  FROM books b
                  LEFT JOIN borrow_records br ON b.id = br.book_id 
                      AND br.borrow_date BETWEEN :date_from AND :date_to
                  WHERE b.deleted_at IS NULL
                  GROUP BY b.genre
                  ORDER BY total_borrows DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':date_from', $data->date_from);
        $stmt->bindParam(':date_to', $data->date_to);
        $stmt->execute();
        $category_performance = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $report_data['category_performance'] = $category_performance;
    }
    
    // Prescriptive data from recommender system
    if ($data->report_type === 'prescriptive' || $data->report_type === 'combined') {
        // Get recommendation insights
        $query = "SELECT 
                    b.genre,
                    COUNT(DISTINCT br.user_id) as unique_borrowers,
                    AVG(DATEDIFF(br.return_date, br.borrow_date)) as avg_borrow_duration,
                    COUNT(br.id) as total_borrows
                  FROM borrow_records br
                  JOIN books b ON br.book_id = b.id
                  WHERE br.borrow_date BETWEEN :date_from AND :date_to
                  GROUP BY b.genre
                  ORDER BY total_borrows DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':date_from', $data->date_from);
        $stmt->bindParam(':date_to', $data->date_to);
        $stmt->execute();
        $genre_insights = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Generate recommendations based on data
        $recommendations = array();
        foreach ($genre_insights as $insight) {
            if ($insight['total_borrows'] > 10) {
                $recommendations[] = array(
                    'type' => 'acquisition',
                    'message' => "Consider acquiring more books in " . $insight['genre'] . " genre (high demand: " . $insight['total_borrows'] . " borrows)",
                    'priority' => 'high'
                );
            }
            if ($insight['avg_borrow_duration'] > 21) {
                $recommendations[] = array(
                    'type' => 'policy',
                    'message' => "Review borrowing period for " . $insight['genre'] . " genre (avg duration: " . round($insight['avg_borrow_duration']) . " days)",
                    'priority' => 'medium'
                );
            }
        }
        
        $report_data['genre_insights'] = $genre_insights;
        $report_data['recommendations'] = $recommendations;
    }
    
    // Save report to database
    $query = "INSERT INTO reports (title, report_type, generated_by, date_from, date_to, data)
              VALUES (:title, :report_type, :generated_by, :date_from, :date_to, :data)";
    $stmt = $db->prepare($query);
    
    $title = ucfirst($data->report_type) . " Report - " . $data->date_from . " to " . $data->date_to;
    $data_json = json_encode($report_data);
    
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':report_type', $data->report_type);
    $stmt->bindParam(':generated_by', $data->generated_by);
    $stmt->bindParam(':date_from', $data->date_from);
    $stmt->bindParam(':date_to', $data->date_to);
    $stmt->bindParam(':data', $data_json);
    
    if ($stmt->execute()) {
        $report_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array(
            "message" => "Report generated successfully",
            "report_id" => $report_id,
            "data" => $report_data
        ));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Unable to generate report"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data"));
}
?>
