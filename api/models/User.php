<?php

  class User {
      private $conn;
      private $table_name = "users";

      public $id;
      public $email;
      public $password;
      public $name;
      public $role;
      public $created_at;
      public $is_active;
      public $student_id;
      public $phone_number;
      public $address;
      public $profile_picture;
      public $library_card_number;
      public $fine_amount;
      public $education_level;
      public $school;
      public $age;
      public $sex;
      public $birth_date;
      public $professional_category;
      public $approval_status;
      public $approved_by;
      public $approved_at;
      public $rejection_reason;

      public function __construct($db) {
          $this->conn = $db;
      }

      // Get all users with pagination
      public function read($limit = 50, $offset = 0) {
          $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
          $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
          $stmt->execute();
          return $stmt;
      }

      // Get single user
      public function read_single() {
          $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(1, $this->id);
          $stmt->execute();

          $row = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($row) {
              foreach ($row as $key => $value) {
                  if (property_exists($this, $key)) {
                      $this->$key = $value;
                  }
              }
              return true;
          }
          return false;
      }

      // ✅ Create user (no student_id yet — generated after insert)
      public function create() {
          $query = "INSERT INTO " . $this->table_name . " 
                  SET email=:email, password=:password, name=:name, role=:role,
                      education_level=:education_level, 
                      school=:school,
                      age=:age,
                      sex=:sex,
                      birth_date=:birth_date,
                      phone_number=:phone_number, 
                      address=:address, library_card_number=:library_card_number,
                      professional_category=:professional_category,
                      approval_status='pending'";

          $stmt = $this->conn->prepare($query);

          // Hash password
          $this->password = password_hash($this->password, PASSWORD_DEFAULT);

          // Bind data
          $stmt->bindParam(":email", $this->email);
          $stmt->bindParam(":password", $this->password);
          $stmt->bindParam(":name", $this->name);
          $stmt->bindParam(":role", $this->role);
          $stmt->bindParam(":phone_number", $this->phone_number);
          $stmt->bindParam(":address", $this->address);
          $stmt->bindParam(":library_card_number", $this->library_card_number);
          $stmt->bindParam(":education_level", $this->education_level);
          $stmt->bindParam(":school", $this->school);
          $stmt->bindParam(":age", $this->age);
          $stmt->bindParam(":sex", $this->sex);
          $stmt->bindParam(":birth_date", $this->birth_date);
          $stmt->bindParam(":professional_category", $this->professional_category);

          if ($stmt->execute()) {
              return true;
          }
          return false;
      }

      // Update user
      public function update() {
          $query = "UPDATE " . $this->table_name . " 
                  SET email=:email, name=:name, role=:role, is_active=:is_active,
                      student_id=:student_id, phone_number=:phone_number, 
                      address=:address, fine_amount=:fine_amount,
                      education_level=:education_level, school=:school,
                      age=:age, sex=:sex, birth_date=:birth_date,
                      professional_category=:professional_category
                  WHERE id=:id";

          $stmt = $this->conn->prepare($query);

          $stmt->bindParam(":email", $this->email);
          $stmt->bindParam(":name", $this->name);
          $stmt->bindParam(":role", $this->role);
          $stmt->bindParam(":is_active", $this->is_active);
          $stmt->bindParam(":student_id", $this->student_id);
          $stmt->bindParam(":phone_number", $this->phone_number);
          $stmt->bindParam(":address", $this->address);
          $stmt->bindParam(":fine_amount", $this->fine_amount);
          $stmt->bindParam(":education_level", $this->education_level);
          $stmt->bindParam(":school", $this->school);
          $stmt->bindParam(":age", $this->age);
          $stmt->bindParam(":sex", $this->sex);
          $stmt->bindParam(":birth_date", $this->birth_date);
          $stmt->bindParam(":professional_category", $this->professional_category);
          $stmt->bindParam(":id", $this->id);

          return $stmt->execute();
      }

      // Delete user
      public function delete() {
          $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(1, $this->id);
          return $stmt->execute();
      }

      // Login user
      public function login() {
          $query = "SELECT id, email, password, name, role, is_active FROM " . $this->table_name . " WHERE email = ? AND is_active = 1 LIMIT 0,1";
          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(1, $this->email);
          $stmt->execute();

          $row = $stmt->fetch(PDO::FETCH_ASSOC);
          if ($row && password_verify($this->password, $row['password'])) {
              $this->id = $row['id'];
              $this->name = $row['name'];
              $this->role = $row['role'];
              return true;
          }
          return false;
      }

      // Approve user
      public function approve($librarian_id) {
          $query = "UPDATE " . $this->table_name . " 
                  SET approval_status='approved', approved_by=:librarian_id, 
                      approved_at=CURRENT_TIMESTAMP, is_active=1
                  WHERE id=:id";

          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(":librarian_id", $librarian_id);
          $stmt->bindParam(":id", $this->id);

          return $stmt->execute();
      }

      // Reject user
      public function reject($librarian_id, $reason) {
          $query = "UPDATE " . $this->table_name . " 
                  SET approval_status='rejected', approved_by=:librarian_id, 
                      approved_at=CURRENT_TIMESTAMP, rejection_reason=:reason, is_active=0
                  WHERE id=:id";

          $stmt = $this->conn->prepare($query);
          $stmt->bindParam(":librarian_id", $librarian_id);
          $stmt->bindParam(":reason", $reason);
          $stmt->bindParam(":id", $this->id);

          return $stmt->execute();
      }

      // Get pending approvals
      public function getPendingApprovals() {
          $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE approval_status='pending' AND role='student' 
                  ORDER BY created_at DESC";
          $stmt = $this->conn->prepare($query);
          $stmt->execute();
          return $stmt;
      }

        // ✅ Function to get next student_id
        public function getNextStudentId($prefix = '') {
            // Query the latest student_id
            $query = "SELECT student_id FROM " . $this->table_name . " 
                    WHERE student_id IS NOT NULL 
                    ORDER BY id DESC LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // Extract the last numeric part
            if ($row && !empty($row['student_id'])) {
                $lastNumeric = intval(preg_replace('/[^0-9]/', '', $row['student_id']));
                $nextId = $lastNumeric + 1;
            } else {
                $nextId = 1; // first record
            }

            // Format to 4 digits (0001, 0002, etc.)
            $formatted = str_pad($nextId, 4, '0', STR_PAD_LEFT);

            // Return with prefix if provided
            return $prefix . $formatted;
        }
  }

  ?>
