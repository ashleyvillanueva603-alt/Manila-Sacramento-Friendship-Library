# Backend API Requirements for Library System

## Critical Issues to Fix

### 1. User Registration - Missing Fields

**Problem:** User details (age, sex, birth_date, professional_category) are not being saved to the database.

**Solution:** Update your `api/auth/register.php` to accept and save these additional fields:

\`\`\`php
// api/auth/register.php
$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$password = password_hash($data->password, PASSWORD_DEFAULT);
$name = $data->name;
$role = $data->role ?? 'student';
$student_id = $data->student_id ?? null;
$phone_number = $data->phone_number ?? null;
$address = $data->address ?? null;
$education_level = $data->education_level ?? null;
$school = $data->school ?? null;
$professional_category = $data->professional_category ?? null;
$age = $data->age ?? null;
$sex = $data->sex ?? null;
$birth_date = $data->birth_date ?? null;
$is_active = 0; // Pending approval by default

$query = "INSERT INTO users SET
    email = :email,
    password = :password,
    name = :name,
    role = :role,
    student_id = :student_id,
    phone_number = :phone_number,
    address = :address,
    education_level = :education_level,
    school = :school,
    professional_category = :professional_category,
    age = :age,
    sex = :sex,
    birth_date = :birth_date,
    isActive = :is_active,
    createdAt = NOW()";

$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':password', $password);
$stmt->bindParam(':name', $name);
$stmt->bindParam(':role', $role);
$stmt->bindParam(':student_id', $student_id);
$stmt->bindParam(':phone_number', $phone_number);
$stmt->bindParam(':address', $address);
$stmt->bindParam(':education_level', $education_level);
$stmt->bindParam(':school', $school);
$stmt->bindParam(':professional_category', $professional_category);
$stmt->bindParam(':age', $age);
$stmt->bindParam(':sex', $sex);
$stmt->bindParam(':birth_date', $birth_date);
$stmt->bindParam(':is_active', $is_active);
\`\`\`

### 2. User Approval System

**Problem:** Approved users cannot log in because the frontend checks for `approved` field but API returns `isActive`.

**Solution:** The frontend has been updated to check the `isActive` field. Ensure your database uses `isActive` (TINYINT) to track approval status:
- `isActive = 0` → Pending approval
- `isActive = 1` → Approved

### 3. Borrow Approval System

**Problem:** Borrow approvals page doesn't show pending requests.

**Solution:** Create `api/borrow/pending.php` to return borrow requests with pending status:

\`\`\`php
// api/borrow/pending.php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT 
    br.id,
    br.user_id,
    u.name as user_name,
    u.email as user_email,
    br.book_id,
    b.title as book_title,
    b.author as book_author,
    b.cover_image as book_cover,
    br.borrow_date,
    br.due_date,
    br.created_at
FROM borrow_records br
LEFT JOIN users u ON br.user_id = u.id
LEFT JOIN books b ON br.book_id = b.id
WHERE br.status = 'pending' OR (br.status = '' AND br.return_date IS NULL)
ORDER BY br.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "records" => $records
]);
?>
\`\`\`

Also create `api/borrow/approve.php`:

\`\`\`php
// api/borrow/approve.php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

$borrow_id = $data->borrow_id;
$librarian_id = $data->librarian_id;
$action = $data->action; // 'approve' or 'reject'

if ($action === 'approve') {
    $query = "UPDATE borrow_records SET 
        status = 'approved',
        approved_by = :librarian_id,
        approved_at = NOW()
    WHERE id = :borrow_id";
} else {
    $reason = $data->reason ?? 'No reason provided';
    $query = "UPDATE borrow_records SET 
        status = 'rejected',
        rejection_reason = :reason,
        approved_by = :librarian_id,
        approved_at = NOW()
    WHERE id = :borrow_id";
}

$stmt = $db->prepare($query);
$stmt->bindParam(':borrow_id', $borrow_id);
$stmt->bindParam(':librarian_id', $librarian_id);

if ($action === 'reject') {
    $stmt->bindParam(':reason', $reason);
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Borrow request " . $action . "d successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to " . $action . " borrow request"
    ]);
}
?>
\`\`\`

### 4. Same-Day Return (No Due Date)

**Problem:** Books are assigned a 14-day due date.

**Solution:** Update `api/borrow/create.php` to set return_date = borrow_date:

\`\`\`php
// api/borrow/create.php
$data = json_decode(file_get_contents("php://input"));

$user_id = $data->user_id;
$book_id = $data->book_id;
$borrow_date = $data->borrow_date ?? date('Y-m-d');
$return_date = $data->return_date ?? $borrow_date; // Same day
$due_date = $data->due_date ?? $borrow_date; // Same day
$status = $data->status ?? 'pending'; // Pending approval

$query = "INSERT INTO borrow_records SET
    user_id = :user_id,
    book_id = :book_id,
    borrow_date = :borrow_date,
    return_date = :return_date,
    due_date = :due_date,
    status = :status,
    created_at = NOW()";
\`\`\`

### 5. Database Schema Updates

Run this SQL to add missing fields:

\`\`\`sql
-- Add missing user fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INT NULL,
ADD COLUMN IF NOT EXISTS sex VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS birth_date DATE NULL,
ADD COLUMN IF NOT EXISTS professional_category VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS address TEXT NULL,
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS school VARCHAR(200) NULL;

-- Add borrow approval fields
ALTER TABLE borrow_records
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INT NULL,
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;
\`\`\`

## Summary

1. **Registration**: Save all user fields including age, sex, birth_date, professional_category
2. **Login**: Use `isActive` field to check if user is approved
3. **User Management**: Filter users by `isActive = 1`
4. **Borrow Approvals**: Create pending.php and approve.php endpoints
5. **Due Dates**: Set return_date = borrow_date (same day return)
