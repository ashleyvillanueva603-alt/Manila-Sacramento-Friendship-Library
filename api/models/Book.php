<?php

class Book {
    private $conn;
    private $table_name = "books";

    public $id;
    public $title;
    public $author;
    public $isbn;
    public $genre;
    public $description;
    public $published_year;
    public $total_copies;
    public $available_copies;
    public $cover_url;
    public $created_at;
    public $deleted_at;
    public $google_books_id;
    public $publisher;
    public $page_count;
    public $language;
    public $categories;
    public $accession_number;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all books with search and filter
    public function read($search = '', $genre = '', $limit = 50, $offset = 0, $include_deleted = false) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        
        if (!$include_deleted) {
            $query .= " AND deleted_at IS NULL";
        }
        
        if (!empty($search)) {
            $query .= " AND (title LIKE :search OR author LIKE :search OR description LIKE :search)";
        }
        
        if (!empty($genre)) {
            $query .= " AND genre = :genre";
        }
        
        $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%{$search}%";
            $stmt->bindParam(':search', $search_term);
        }
        
        if (!empty($genre)) {
            $stmt->bindParam(':genre', $genre);
        }
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }

    // Get single book
    public function read_single($include_deleted = false) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        
        if (!$include_deleted) {
            $query .= " AND deleted_at IS NULL";
        }
        
        $query .= " LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row) {
            $this->title = $row['title'];
            $this->author = $row['author'];
            $this->isbn = $row['isbn'];
            $this->accession_number = $row['accession_number'];
            $this->genre = $row['genre'];
            $this->description = $row['description'];
            $this->published_year = $row['published_year'];
            $this->total_copies = $row['total_copies'];
            $this->available_copies = $row['available_copies'];
            $this->cover_url = $row['cover_url'];
            $this->created_at = $row['created_at'];
            $this->deleted_at = $row['deleted_at'];
            $this->google_books_id = $row['google_books_id'];
            $this->publisher = $row['publisher'];
            $this->page_count = $row['page_count'];
            $this->language = $row['language'];
            $this->categories = $row['categories'];
            return true;
        }
        return false;
    }

    // Create book
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET title=:title, author=:author, isbn=:isbn, 
                    accession_number=:accession_number, genre=:genre, 
                    description=:description, published_year=:published_year, 
                    total_copies=:total_copies, available_copies=:available_copies,
                    cover_url=:cover_url, google_books_id=:google_books_id,
                    publisher=:publisher, page_count=:page_count, 
                    language=:language, categories=:categories";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":author", $this->author);
        $stmt->bindParam(":isbn", $this->isbn);
        $stmt->bindParam(":accession_number", $this->accession_number);
        $stmt->bindParam(":genre", $this->genre);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":published_year", $this->published_year);
        $stmt->bindParam(":total_copies", $this->total_copies);
        $stmt->bindParam(":available_copies", $this->available_copies);
        $stmt->bindParam(":cover_url", $this->cover_url);
        $stmt->bindParam(":google_books_id", $this->google_books_id);
        $stmt->bindParam(":publisher", $this->publisher);
        $stmt->bindParam(":page_count", $this->page_count);
        $stmt->bindParam(":language", $this->language);
        $stmt->bindParam(":categories", $this->categories);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update book
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                SET title=:title, author=:author, isbn=:isbn, 
                    accession_number=:accession_number, genre=:genre,
                    description=:description, published_year=:published_year,
                    total_copies=:total_copies, available_copies=:available_copies,
                    cover_url=:cover_url, publisher=:publisher, 
                    page_count=:page_count, language=:language, categories=:categories
                WHERE id=:id AND deleted_at IS NULL";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":author", $this->author);
        $stmt->bindParam(":isbn", $this->isbn);
        $stmt->bindParam(":accession_number", $this->accession_number);
        $stmt->bindParam(":genre", $this->genre);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":published_year", $this->published_year);
        $stmt->bindParam(":total_copies", $this->total_copies);
        $stmt->bindParam(":available_copies", $this->available_copies);
        $stmt->bindParam(":cover_url", $this->cover_url);
        $stmt->bindParam(":publisher", $this->publisher);
        $stmt->bindParam(":page_count", $this->page_count);
        $stmt->bindParam(":language", $this->language);
        $stmt->bindParam(":categories", $this->categories);
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Soft delete book (sets deleted_at timestamp)
    public function softDelete() {
        $query = "UPDATE " . $this->table_name . " 
                SET deleted_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND deleted_at IS NULL";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Restore soft-deleted book
    public function restore() {
        $query = "UPDATE " . $this->table_name . " 
                SET deleted_at = NULL 
                WHERE id = ? AND deleted_at IS NOT NULL";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Hard delete book (permanent deletion)
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update available copies
    public function updateAvailableCopies($change) {
        $query = "UPDATE " . $this->table_name . " 
                SET available_copies = available_copies + :change 
                WHERE id = :id AND (available_copies + :change) >= 0 AND deleted_at IS NULL";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":change", $change);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    // Get total number of books matching search criteria
    public function count($search = '', $genre = '', $include_deleted = false) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        
        if (!$include_deleted) {
            $query .= " AND deleted_at IS NULL";
        }
        
        if (!empty($search)) {
            $query .= " AND (title LIKE :search OR author LIKE :search OR description LIKE :search)";
        }
        
        if (!empty($genre)) {
            $query .= " AND genre = :genre";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if (!empty($search)) {
            $search_term = "%{$search}%";
            $stmt->bindParam(':search', $search_term);
        }
        
        if (!empty($genre)) {
            $stmt->bindParam(':genre', $genre);
        }
        
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return (int)$row['total'];
    }
}
?>
