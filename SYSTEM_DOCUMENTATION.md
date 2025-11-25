# Library Management System - Comprehensive Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Modules and Components](#modules-and-components)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Workflows and Processes](#workflows-and-processes)
7. [APIs and Endpoints](#apis-and-endpoints)
8. [Data Model](#data-model)
9. [Error Handling and Notifications](#error-handling-and-notifications)
10. [Security and Authentication](#security-and-authentication)
11. [Deployment and Maintenance](#deployment-and-maintenance)
12. [Future Enhancements](#future-enhancements)

---

## System Overview

### Purpose
The Library Management System (LibraryHub) is a modern, comprehensive web-based application designed to automate and streamline library operations for educational institutions. The system provides an intuitive interface for managing books, users, borrowing transactions, and analytics while improving the overall user experience for both library staff and students.

### Goals and Objectives
- **Automate Library Operations**: Eliminate manual processes for book cataloging, borrowing, and returns
- **Improve User Experience**: Provide students with easy access to browse, search, and request books
- **Enhance Tracking**: Real-time monitoring of book availability, borrowing history, and overdue items
- **Data-Driven Insights**: Generate comprehensive reports and analytics for informed decision-making
- **Streamline Approvals**: Implement efficient workflows for user registration and borrow request approvals
- **Reduce Administrative Burden**: Automate fine calculations, notifications, and inventory management

### Target Users
1. **Students/Patrons**: Browse books, request borrowing, track their reading history, and manage fines
2. **Librarians**: Manage book catalog, approve borrow requests, track inventory, and generate reports
3. **Administrators**: Oversee system operations, manage users, and access advanced analytics

---

## Key Features

### 1. User Registration and Approval
- Self-service registration for students with comprehensive profile information
- Librarian approval workflow for new user accounts
- Profile management with personal details, education level, and contact information
- Automatic library card number generation

### 2. Book Catalog Browsing and Search
- Comprehensive book catalog with 60+ pre-loaded titles
- Advanced search functionality with filters by title, author, genre, and ISBN
- Google Books API integration for enhanced book information
- Real-time availability status display
- Detailed book information including cover images, descriptions, and metadata

### 3. Borrow and Return Management
- Student-initiated borrow requests with librarian approval workflow
- Automated due date calculation (14-day default borrowing period)
- Book return processing with automatic availability updates
- Renewal tracking and management
- Overdue detection and status updates

### 4. Inventory and Acquisition Tracking
- Real-time inventory management with copy tracking
- Accession number system for unique copy identification
- Book request system for students to suggest new acquisitions
- Soft delete functionality to maintain historical records
- Availability tracking across multiple copies

### 5. Reports and Analytics
- **Dashboard Statistics**: Total books, active members, borrowing trends
- **Category Performance**: Analysis of genre popularity and circulation
- **Book Usage Reports**: Most borrowed books and circulation patterns
- **Borrower Insights**: User engagement and reading patterns
- **Time-Series Analytics**: Borrowing trends over 3, 6, or 12 months
- **Philippines Map Visualization**: Geographic distribution of library usage

### 6. User Notifications and Status Updates
- System notifications for borrow approvals and rejections
- Due date reminders and overdue alerts
- Fine notifications and payment confirmations
- Email and SMS notification support (configurable)

### 7. Admin Controls with Activity Logs
- User management with approval/rejection capabilities
- Book catalog management (CRUD operations)
- Borrow approval workflow management
- Fine management and waiver system
- Comprehensive borrowing history and audit trails

---

## System Architecture

### Overall Structure

The Library Management System follows a modern three-tier architecture:

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 15 App Router + React + TypeScript + Tailwind CSS  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      API/Service Layer                       │
│         RESTful API (PHP Backend) + API Service Client       │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│        MySQL Database + Dexie.js (IndexedDB for local)      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks + SWR for data fetching
- **Icons**: Lucide React
- **Fonts**: Inter (sans-serif), JetBrains Mono (monospace)

#### Backend
- **API Server**: PHP (RESTful architecture)
- **Database**: MySQL 8.0+
- **Local Storage**: Dexie.js (IndexedDB wrapper)
- **Authentication**: Session-based with localStorage

#### Third-Party Integrations
- **Google Books API**: Enhanced book metadata and cover images
- **Hostinger**: API hosting (gray-skunk-937601.hostingersite.com)

### Deployment Architecture
- **Frontend**: Vercel (Next.js optimized hosting)
- **Backend API**: Hostinger shared hosting
- **Database**: MySQL on Hostinger
- **CDN**: Vercel Edge Network for static assets

---

## Modules and Components

### 1. User Management Module

**Purpose**: Handle user registration, authentication, profile management, and approval workflows.

**Key Components**:
- `hooks/use-auth.tsx`: Authentication hook managing user sessions
- `components/auth/auth-guard.tsx`: Route protection and role-based access control
- `components/auth/login-form.tsx`: User login interface
- `components/auth/register-form.tsx`: Student registration form
- `app/admin/users/page.tsx`: User management dashboard for librarians
- `app/admin/user-approvals/page.tsx`: User approval workflow interface
- `app/profile/page.tsx`: User profile management

**Functionality**:
- User registration with comprehensive profile data
- Email/password authentication
- Role-based access control (student vs librarian)
- Profile editing and updates
- User approval/rejection by librarians
- Account activation/deactivation

### 2. Book Management Module

**Purpose**: Manage the library's book catalog, including CRUD operations and inventory tracking.

**Key Components**:
- `app/admin/books/page.tsx`: Book catalog management interface
- `app/books/page.tsx`: Public book browsing interface
- `lib/google-books-api.ts`: Google Books API integration
- `lib/database.ts`: Book data models and local storage

**Functionality**:
- Add new books with metadata (title, author, ISBN, genre, etc.)
- Edit existing book information
- Soft delete books (maintain historical records)
- Track multiple copies with accession numbers
- Real-time availability updates
- Google Books API integration for enhanced metadata
- Search and filter capabilities

### 3. Borrowing and Returning Module

**Purpose**: Handle the complete borrowing lifecycle from request to return.

**Key Components**:
- `app/admin/borrow-approvals/page.tsx`: Borrow request approval interface
- `app/admin/borrowing/page.tsx`: Active borrowing management
- `app/admin/history/page.tsx`: Complete borrowing history
- `app/my-books/page.tsx`: Student's current borrows
- `app/my-history/page.tsx`: Student's borrowing history
- `lib/api-service.ts`: API methods for borrow operations

**Functionality**:
- Student-initiated borrow requests
- Librarian approval workflow
- Automatic due date calculation (14 days)
- Book return processing
- Renewal tracking
- Overdue detection and status updates
- Fine calculation for late returns

**Workflow**:
\`\`\`
Student Request → Pending Approval → Librarian Review → 
Approved/Rejected → Active Borrow → Return → History
\`\`\`

### 4. Reports Module

**Purpose**: Generate comprehensive reports and analytics for library operations.

**Key Components**:
- `app/admin/dashboard/page.tsx`: Main analytics dashboard
- `app/admin/analytics/page.tsx`: Advanced analytics interface
- `app/admin/reports/page.tsx`: Report generation interface
- `components/dashboard/custom-philippines-map.tsx`: Geographic visualization
- `scripts/analytics-views.sql`: Database views for analytics

**Functionality**:
- Real-time dashboard statistics
- Borrowing trends over time
- Category performance analysis
- Book usage reports
- Borrower insights and engagement metrics
- Geographic distribution visualization
- Exportable reports (CSV, PDF)

### 5. Notifications Module

**Purpose**: Manage system notifications and user communications.

**Key Components**:
- `app/admin/notifications/page.tsx`: Notification management interface
- Database: `notifications` table

**Functionality**:
- System notifications for borrow approvals
- Due date reminders
- Overdue alerts
- Fine notifications
- Email and SMS support (configurable)
- Notification history and status tracking

### 6. Admin & Settings Module

**Purpose**: System configuration and administrative controls.

**Key Components**:
- `app/admin/fines/page.tsx`: Fine management interface
- `app/admin/library-cards/page.tsx`: Library card management
- `app/request-book/page.tsx`: Book request interface
- `app/admin/requests/page.tsx`: Book request management

**Functionality**:
- Fine management (create, waive, mark as paid)
- Library card generation and management
- Book acquisition requests
- System settings and configuration
- User role management

### Module Interactions

\`\`\`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▶│     Book     │────▶│   Borrowing  │
│  Management  │     │  Management  │     │   & Return   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                    Reports & Analytics                    │
└──────────────────────────────────────────────────────────┘
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│Notifications │     │    Fines     │     │   Settings   │
└──────────────┘     └──────────────┘     └──────────────┘
\`\`\`

---

## User Roles and Permissions

### 1. Student/Patron Role

**Access Level**: Limited

**Permissions**:
- ✅ Browse book catalog
- ✅ Search and filter books
- ✅ Request to borrow books
- ✅ View own borrowing history
- ✅ View current borrows and due dates
- ✅ Request new book acquisitions
- ✅ View and pay fines
- ✅ Update own profile
- ❌ Access admin dashboards
- ❌ Approve borrow requests
- ❌ Manage other users
- ❌ Add/edit/delete books

**Default Routes**:
- `/books` - Browse catalog
- `/my-books` - Current borrows
- `/my-history` - Borrowing history
- `/request-book` - Request new books
- `/profile` - Profile management
- `/my-fines` - View fines

### 2. Librarian Role

**Access Level**: Full Administrative Access

**Permissions**:
- ✅ All student permissions
- ✅ Approve/reject borrow requests
- ✅ Approve/reject user registrations
- ✅ Add, edit, delete books
- ✅ Manage user accounts
- ✅ Process book returns
- ✅ Create and manage fines
- ✅ Waive fines
- ✅ View all borrowing history
- ✅ Generate reports and analytics
- ✅ Manage book requests
- ✅ Send notifications
- ✅ Manage library cards

**Default Routes**:
- `/admin/dashboard` - Analytics dashboard
- `/admin/books` - Book management
- `/admin/users` - User management
- `/admin/user-approvals` - User approval workflow
- `/admin/borrow-approvals` - Borrow approval workflow
- `/admin/borrowing` - Active borrows
- `/admin/history` - Complete history
- `/admin/requests` - Book requests
- `/admin/fines` - Fine management
- `/admin/analytics` - Advanced analytics
- `/admin/notifications` - Notification management

### 3. Administrator Role (Future)

**Access Level**: System-wide

**Planned Permissions**:
- ✅ All librarian permissions
- ✅ System configuration
- ✅ User role management
- ✅ Backup and restore
- ✅ Audit logs
- ✅ Integration management

### Role-Based Access Control Implementation

The system uses the `AuthGuard` component to protect routes:

\`\`\`typescript
// Protect route requiring authentication
<AuthGuard>
  <PageContent />
</AuthGuard>

// Protect route requiring librarian role
<AuthGuard requireAdmin={true}>
  <AdminPageContent />
</AuthGuard>
\`\`\`

---

## Workflows and Processes

### 1. User Registration and Approval Workflow

**Process Flow**:
\`\`\`
┌─────────────────┐
│  Student visits │
│  /register page │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Student fills registration form:    │
│ - Email, Password, Name             │
│ - Student ID, Phone, Address        │
│ - Education Level, School           │
│ - Age, Sex, Birth Date              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ System creates user account with:   │
│ - approved: false                   │
│ - is_active: true                   │
│ - role: 'student'                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Librarian reviews in                │
│ /admin/user-approvals               │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Approve │ │Reject  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────────┐
│Student │ │Account     │
│can     │ │remains     │
│login   │ │unapproved  │
└────────┘ └────────────┘
\`\`\`

**Steps**:
1. Student navigates to registration page
2. Fills out comprehensive registration form
3. System validates input and creates user account
4. Account status set to "pending approval"
5. Librarian receives notification of new registration
6. Librarian reviews user details in approval interface
7. Librarian approves or rejects with optional notes
8. Student receives notification of approval status
9. Approved students can log in and access system

### 2. Borrow Request and Approval Workflow

**Process Flow**:
\`\`\`
┌─────────────────┐
│ Student browses │
│ book catalog    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Student clicks "Borrow" button      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ System creates borrow record:       │
│ - status: 'pending'                 │
│ - borrow_date: today                │
│ - due_date: today + 14 days         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Request appears in                  │
│ /admin/borrow-approvals             │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Approve │ │Reject  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────────┐ ┌────────────┐
│status:     │ │Request     │
│'borrowed'  │ │removed     │
│            │ │from list   │
│Book appears│ │            │
│in student's│ │Student     │
│My Books    │ │notified    │
└────────────┘ └────────────┘
\`\`\`

**Steps**:
1. Student searches/browses book catalog
2. Student clicks "Borrow" on available book
3. System creates borrow record with "pending" status
4. Available copies decremented by 1
5. Request appears in librarian's approval queue
6. Librarian reviews request details (student info, book info)
7. Librarian approves or rejects with optional reason
8. If approved:
   - Status changes to "borrowed"
   - Book appears in student's "My Books"
   - Due date set to 14 days from approval
9. If rejected:
   - Request removed from queue
   - Available copies incremented back
   - Student receives rejection notification with reason

### 3. Book Return and Penalty Handling Workflow

**Process Flow**:
\`\`\`
┌─────────────────┐
│ Student returns │
│ book physically │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Librarian/Student clicks "Return"   │
│ in My Books or Admin Borrowing      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ System checks return date vs        │
│ due date                            │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────────────┐
│On time │ │Overdue             │
└───┬────┘ └───┬────────────────┘
    │          │
    │          ▼
    │     ┌────────────────────┐
    │     │Calculate fine:     │
    │     │days_overdue × $1.00│
    │     └───┬────────────────┘
    │         │
    │         ▼
    │     ┌────────────────────┐
    │     │Create fine record  │
    │     │in fines table      │
    │     └───┬────────────────┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Update borrow record:               │
│ - return_date: now                  │
│ - status: 'returned'                │
│ - fine_amount: calculated           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Increment book available_copies     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Book removed from "My Books"        │
│ Appears in "My History"             │
└─────────────────────────────────────┘
\`\`\`

**Steps**:
1. Student returns book to library physically
2. Librarian or student clicks "Return" button
3. System records return date
4. System compares return date with due date
5. If overdue:
   - Calculate fine: (days overdue) × $1.00 per day
   - Create fine record in database
   - Update borrow record with fine amount
   - Send fine notification to student
6. Update borrow record status to "returned"
7. Increment book's available copies
8. Book removed from "My Books"
9. Record appears in borrowing history

### 4. Book Acquisition and Catalog Updates Workflow

**Process Flow**:
\`\`\`
┌─────────────────┐
│ Student submits │
│ book request    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Request appears in                  │
│ /admin/requests                     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Librarian reviews request           │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Approve │ │Reject  │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────────┐ ┌────────────┐
│Librarian   │ │Student     │
│acquires    │ │notified    │
│book        │ │with reason │
└─────┬──────┘ └────────────┘
      │
      ▼
┌────────────────────────────────────┐
│ Librarian adds book to catalog:    │
│ - Title, Author, ISBN              │
│ - Genre, Description               │
│ - Copies, Cover Image              │
│ - Accession Number                 │
└─────┬──────────────────────────────┘
      │
      ▼
┌────────────────────────────────────┐
│ Book appears in catalog            │
│ Available for borrowing            │
└────────────────────────────────────┘
\`\`\`

**Steps**:
1. Student submits book request with title, author, reason
2. Request appears in librarian's request queue
3. Librarian reviews request and student justification
4. Librarian approves or rejects with notes
5. If approved:
   - Librarian acquires physical book
   - Librarian adds book to catalog via /admin/books
   - System generates accession number
   - Book becomes available for borrowing
6. If rejected:
   - Student receives notification with reason
7. Request status updated to "fulfilled" or "rejected"

### 5. Generating Reports (Borrowed and Overdue Books)

**Process Flow**:
\`\`\`
┌─────────────────┐
│ Librarian       │
│ accesses        │
│ /admin/reports  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Select report type:                 │
│ - Currently Borrowed Books          │
│ - Overdue Books                     │
│ - Borrowing History                 │
│ - Category Performance              │
│ - User Activity                     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Set filters and parameters:         │
│ - Date range                        │
│ - User/Book filters                 │
│ - Sort order                        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ System queries database:            │
│ - Joins relevant tables             │
│ - Applies filters                   │
│ - Calculates metrics                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Display report with:                │
│ - Summary statistics                │
│ - Detailed records table            │
│ - Visualizations (charts/graphs)    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Export options:                     │
│ - CSV download                      │
│ - PDF generation                    │
│ - Print view                        │
└─────────────────────────────────────┘
\`\`\`

**Report Types**:

1. **Currently Borrowed Books**:
   - All active borrows (status = 'borrowed')
   - Student name, book title, borrow date, due date
   - Days remaining until due
   - Sorted by due date

2. **Overdue Books**:
   - All borrows past due date without return
   - Student contact information
   - Days overdue
   - Calculated fine amount
   - Sorted by days overdue (descending)

3. **Borrowing History**:
   - All completed borrows
   - Date range filter
   - User/book filters
   - Fine information

4. **Category Performance**:
   - Borrowing statistics by genre
   - Most popular categories
   - Circulation rates

5. **User Activity**:
   - Most active borrowers
   - Reading patterns
   - Fine history

---

## APIs and Endpoints

### Base URL
\`\`\`
https://gray-skunk-937601.hostingersite.com/api
\`\`\`

### Authentication Endpoints

#### POST `/auth/login.php`
**Purpose**: Authenticate user and create session

**Request Body**:
\`\`\`json
{
  "email": "student@example.com",
  "password": "password123"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "studentId": "STU001",
    "approved": true
  },
  "message": "Login successful"
}
\`\`\`

#### POST `/auth/register.php`
**Purpose**: Register new student account

**Request Body**:
\`\`\`json
{
  "email": "newstudent@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "student_id": "STU002",
  "phone_number": "+1234567890",
  "address": "123 Main St",
  "education_level": "college",
  "school": "University Name",
  "age": 20,
  "sex": "female",
  "birth_date": "2004-05-15"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Registration successful. Awaiting librarian approval.",
  "user_id": 2
}
\`\`\`

### Book Endpoints

#### GET `/books/read.php`
**Purpose**: Retrieve books with optional filters

**Query Parameters**:
- `search` (optional): Search term for title/author
- `genre` (optional): Filter by genre
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `id` (optional): Get specific book by ID

**Response**:
\`\`\`json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "978-0-06-112008-4",
      "genre": "Classic",
      "description": "A gripping tale...",
      "published_year": 1960,
      "total_copies": 5,
      "available_copies": 3,
      "cover_url": "https://...",
      "accession_number": "ACC001"
    }
  ],
  "total": 60
}
\`\`\`

#### POST `/books/create.php`
**Purpose**: Add new book to catalog (Librarian only)

**Request Body**:
\`\`\`json
{
  "title": "New Book Title",
  "author": "Author Name",
  "isbn": "978-1234567890",
  "genre": "Fiction",
  "description": "Book description",
  "published_year": 2024,
  "total_copies": 3,
  "available_copies": 3,
  "cover_url": "https://...",
  "accession_number": "ACC061"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Book created successfully",
  "book_id": 61
}
\`\`\`

#### PUT `/books/update.php`
**Purpose**: Update existing book (Librarian only)

**Request Body**:
\`\`\`json
{
  "id": 1,
  "title": "Updated Title",
  "available_copies": 4
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Book updated successfully"
}
\`\`\`

#### DELETE `/books/delete.php`
**Purpose**: Soft delete book (Librarian only)

**Request Body**:
\`\`\`json
{
  "id": 1
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Book deleted successfully"
}
\`\`\`

### Borrow Endpoints

#### POST `/borrow/create.php`
**Purpose**: Create borrow request

**Request Body**:
\`\`\`json
{
  "user_id": 1,
  "book_id": 5,
  "borrow_date": "2024-01-15",
  "due_date": "2024-01-29",
  "status": "pending"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Borrow request created successfully",
  "borrow_id": 10
}
\`\`\`

#### GET `/borrow/history.php`
**Purpose**: Get borrowing history

**Query Parameters**:
- `user_id` (optional): Filter by user
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response**:
\`\`\`json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "book_id": 5,
      "book_title": "1984",
      "book_author": "George Orwell",
      "borrow_date": "2024-01-15",
      "due_date": "2024-01-29",
      "return_date": null,
      "status": "borrowed",
      "renewal_count": 0,
      "fine_amount": 0.00
    }
  ]
}
\`\`\`

#### GET `/borrow/pending.php`
**Purpose**: Get pending borrow requests (Librarian only)

**Response**:
\`\`\`json
{
  "success": true,
  "records": [
    {
      "id": 10,
      "user_id": 2,
      "user_name": "Jane Smith",
      "book_id": 8,
      "book_title": "Dune",
      "status": "pending",
      "borrow_date": "2024-01-20"
    }
  ]
}
\`\`\`

#### POST `/borrow/approve.php`
**Purpose**: Approve or reject borrow request (Librarian only)

**Request Body (Approve)**:
\`\`\`json
{
  "borrow_id": 10,
  "librarian_id": 1,
  "action": "approve"
}
\`\`\`

**Request Body (Reject)**:
\`\`\`json
{
  "borrow_id": 10,
  "librarian_id": 1,
  "action": "reject",
  "reason": "Book currently unavailable"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Borrow request approved successfully"
}
\`\`\`

#### POST `/borrow/return.php`
**Purpose**: Process book return

**Request Body**:
\`\`\`json
{
  "borrow_id": 1
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Book returned successfully",
  "fine_amount": 5.00
}
\`\`\`

### User Endpoints

#### GET `/users/read.php`
**Purpose**: Get users (Librarian only)

**Query Parameters**:
- `id` (optional): Get specific user
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response**:
\`\`\`json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "email": "student@example.com",
      "name": "John Doe",
      "role": "student",
      "student_id": "STU001",
      "phone_number": "+1234567890",
      "approved": true,
      "is_active": true,
      "fine_amount": 0.00
    }
  ]
}
\`\`\`

#### PUT `/users/update.php`
**Purpose**: Update user information

**Request Body**:
\`\`\`json
{
  "id": 1,
  "name": "John Updated Doe",
  "phone_number": "+0987654321",
  "approved": true
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "User updated successfully"
}
\`\`\`

#### DELETE `/users/delete.php`
**Purpose**: Delete user (Librarian only)

**Request Body**:
\`\`\`json
{
  "id": 2
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "User deleted successfully"
}
\`\`\`

### Analytics Endpoints

#### GET `/analytics/overall-stats.php`
**Purpose**: Get dashboard statistics

**Response**:
\`\`\`json
{
  "success": true,
  "stats": {
    "total_books": 60,
    "total_users": 150,
    "active_borrows": 45,
    "overdue_books": 8,
    "total_fines": 125.00
  }
}
\`\`\`

#### GET `/analytics/time-series.php`
**Purpose**: Get borrowing trends over time

**Query Parameters**:
- `days` (optional): Number of days (90, 180, 365)

**Response**:
\`\`\`json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "borrows": 12,
      "returns": 10
    }
  ]
}
\`\`\`

#### GET `/analytics/category-performance.php`
**Purpose**: Get genre popularity statistics

**Response**:
\`\`\`json
{
  "success": true,
  "categories": [
    {
      "genre": "Fiction",
      "total_borrows": 245,
      "unique_borrowers": 78
    }
  ]
}
\`\`\`

### Fines Endpoints

#### GET `/fines/read.php`
**Purpose**: Get fines

**Query Parameters**:
- `user_id` (optional): Filter by user
- `status` (optional): Filter by status (pending/paid/waived)

**Response**:
\`\`\`json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "borrow_record_id": 5,
      "amount": 5.00,
      "reason": "Late return - 5 days overdue",
      "status": "pending",
      "created_date": "2024-01-30"
    }
  ]
}
\`\`\`

#### PUT `/fines/update.php`
**Purpose**: Update fine status

**Request Body**:
\`\`\`json
{
  "id": 1,
  "status": "paid",
  "payment_method": "cash",
  "paid_date": "2024-02-01"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "message": "Fine updated successfully"
}
\`\`\`

---

## Data Model

### Entity Relationship Diagram

\`\`\`
┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │      BOOKS      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ title           │
│ password        │         │ author          │
│ name            │         │ isbn            │
│ role            │         │ accession_number│
│ student_id      │         │ genre           │
│ phone_number    │         │ description     │
│ address         │         │ published_year  │
│ approved        │         │ total_copies    │
│ is_active       │         │ available_copies│
│ education_level │         │ cover_url       │
│ school          │         │ created_at      │
│ age             │         └────────┬────────┘
│ sex             │                  │
│ birth_date      │                  │
└────────┬────────┘                  │
         │                           │
         │         ┌─────────────────┴────────────────┐
         │         │                                  │
         └────────▶│      BORROW_RECORDS              │
                   ├──────────────────────────────────┤
                   │ id (PK)                          │
                   │ user_id (FK → users.id)          │
                   │ book_id (FK → books.id)          │
                   │ borrow_date                      │
                   │ due_date                         │
                   │ return_date                      │
                   │ status                           │
                   │ approved                         │
                   │ approved_by (FK → users.id)      │
                   │ approved_at                      │
                   │ renewal_count                    │
                   │ fine_amount                      │
                   │ fine_paid                        │
                   └────────┬─────────────────────────┘
                            │
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                   ┌─────────────────┐
│     FINES       │                   │  RESERVATIONS   │
├─────────────────┤                   ├─────────────────┤
│ id (PK)         │                   │ id (PK)         │
│ user_id (FK)    │                   │ user_id (FK)    │
│ borrow_record_id│                   │ book_id (FK)    │
│ amount          │                   │ reservation_date│
│ reason          │                   │ status          │
│ status          │                   └─────────────────┘
│ created_date    │
│ paid_date       │
│ payment_method  │
└─────────────────┘

┌─────────────────┐                   ┌─────────────────┐
│ BOOK_REQUESTS   │                   │ NOTIFICATIONS   │
├─────────────────┤                   ├─────────────────┤
│ id (PK)         │                   │ id (PK)         │
│ user_id (FK)    │                   │ user_id (FK)    │
│ book_title      │                   │ type            │
│ author          │                   │ subject         │
│ isbn            │                   │ message         │
│ reason          │                   │ status          │
│ status          │                   │ created_date    │
│ request_date    │                   │ sent_date       │
│ response_date   │                   └─────────────────┘
│ librarian_notes │
└─────────────────┘
\`\`\`

### Table Descriptions

#### USERS Table
**Purpose**: Store user account information for students and librarians

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique user identifier |
| email | VARCHAR(255) | User email (unique) |
| password | VARCHAR(255) | Hashed password |
| name | VARCHAR(255) | Full name |
| role | ENUM | 'student' or 'librarian' |
| student_id | VARCHAR(50) | Student ID number |
| phone_number | VARCHAR(20) | Contact phone |
| address | TEXT | Physical address |
| approved | BOOLEAN | Account approval status |
| approved_by | INT (FK) | Librarian who approved |
| approved_at | TIMESTAMP | Approval timestamp |
| is_active | BOOLEAN | Account active status |
| education_level | VARCHAR(50) | Education level |
| school | VARCHAR(255) | School/institution name |
| age | INT | User age |
| sex | VARCHAR(10) | Gender |
| birth_date | DATE | Date of birth |
| library_card_number | VARCHAR(50) | Unique library card |
| fine_amount | DECIMAL(10,2) | Total outstanding fines |
| created_at | TIMESTAMP | Account creation date |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (library_card_number)
- INDEX (role)
- INDEX (student_id)

#### BOOKS Table
**Purpose**: Store library book catalog

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique book identifier |
| title | VARCHAR(500) | Book title |
| author | VARCHAR(255) | Author name |
| isbn | VARCHAR(20) | ISBN number |
| accession_number | VARCHAR(50) | Unique copy identifier |
| genre | VARCHAR(100) | Book genre/category |
| description | TEXT | Book description |
| published_year | INT | Publication year |
| total_copies | INT | Total copies owned |
| available_copies | INT | Currently available copies |
| cover_url | VARCHAR(500) | Cover image URL |
| google_books_id | VARCHAR(100) | Google Books API ID |
| publisher | VARCHAR(255) | Publisher name |
| page_count | INT | Number of pages |
| language | VARCHAR(10) | Language code |
| categories | JSON | Additional categories |
| created_at | TIMESTAMP | Record creation date |
| deleted_at | TIMESTAMP | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX (title)
- INDEX (author)
- INDEX (isbn)
- INDEX (genre)
- FULLTEXT (title, author, description)

#### BORROW_RECORDS Table
**Purpose**: Track all borrowing transactions

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique borrow record ID |
| user_id | INT (FK) | Borrower user ID |
| book_id | INT (FK) | Borrowed book ID |
| borrow_date | TIMESTAMP | Date borrowed |
| due_date | TIMESTAMP | Return due date |
| return_date | TIMESTAMP | Actual return date (NULL if not returned) |
| status | ENUM | 'pending', 'borrowed', 'returned', 'overdue' |
| approved | BOOLEAN | Approval status |
| approved_by | INT (FK) | Librarian who approved |
| approved_at | TIMESTAMP | Approval timestamp |
| renewal_count | INT | Number of renewals |
| fine_amount | DECIMAL(10,2) | Late return fine |
| fine_paid | BOOLEAN | Fine payment status |

**Indexes**:
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) → users(id)
- FOREIGN KEY (book_id) → books(id)
- INDEX (user_id, status)
- INDEX (due_date)

**Relationships**:
- Many-to-One with USERS (user_id)
- Many-to-One with BOOKS (book_id)
- One-to-Many with FINES

#### FINES Table
**Purpose**: Track library fines and payments

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique fine ID |
| user_id | INT (FK) | User who owes fine |
| borrow_record_id | INT (FK) | Related borrow record |
| amount | DECIMAL(10,2) | Fine amount |
| reason | VARCHAR(255) | Fine reason |
| status | ENUM | 'pending', 'paid', 'waived' |
| created_date | TIMESTAMP | Fine creation date |
| paid_date | TIMESTAMP | Payment date |
| payment_method | VARCHAR(50) | Payment method |

**Relationships**:
- Many-to-One with USERS (user_id)
- Many-to-One with BORROW_RECORDS (borrow_record_id)

#### BOOK_REQUESTS Table
**Purpose**: Track student book acquisition requests

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique request ID |
| user_id | INT (FK) | Requesting user |
| book_title | VARCHAR(500) | Requested book title |
| author | VARCHAR(255) | Author name |
| isbn | VARCHAR(20) | ISBN if known |
| reason | TEXT | Request justification |
| status | ENUM | 'pending', 'approved', 'rejected', 'fulfilled' |
| request_date | TIMESTAMP | Request submission date |
| response_date | TIMESTAMP | Librarian response date |
| librarian_notes | TEXT | Librarian comments |

**Relationships**:
- Many-to-One with USERS (user_id)

#### RESERVATIONS Table
**Purpose**: Track book reservations (future feature)

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique reservation ID |
| user_id | INT (FK) | User making reservation |
| book_id | INT (FK) | Reserved book |
| reservation_date | TIMESTAMP | Reservation date |
| status | ENUM | 'active', 'fulfilled', 'cancelled' |

**Relationships**:
- Many-to-One with USERS (user_id)
- Many-to-One with BOOKS (book_id)

#### NOTIFICATIONS Table
**Purpose**: Track system notifications

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique notification ID |
| user_id | INT (FK) | Recipient user |
| type | ENUM | 'email', 'sms', 'system' |
| subject | VARCHAR(255) | Notification subject |
| message | TEXT | Notification content |
| status | ENUM | 'pending', 'sent', 'failed' |
| created_date | TIMESTAMP | Creation date |
| sent_date | TIMESTAMP | Sent date |

**Relationships**:
- Many-to-One with USERS (user_id)

### Database Triggers

#### update_overdue_status
**Purpose**: Automatically update borrow status to 'overdue' when due date passes

\`\`\`sql
CREATE TRIGGER update_overdue_status
AFTER UPDATE ON borrow_records
FOR EACH ROW
BEGIN
    IF NEW.return_date IS NULL 
       AND NEW.due_date < NOW() 
       AND NEW.status != 'overdue' THEN
        UPDATE borrow_records 
        SET status = 'overdue' 
        WHERE id = NEW.id;
    END IF;
END;
\`\`\`

#### calculate_fine_on_return
**Purpose**: Automatically calculate and create fine records for late returns

\`\`\`sql
CREATE TRIGGER calculate_fine_on_return
AFTER UPDATE ON borrow_records
FOR EACH ROW
BEGIN
    DECLARE days_overdue INT;
    DECLARE fine_per_day DECIMAL(10,2) DEFAULT 1.00;
    
    IF NEW.return_date IS NOT NULL 
       AND OLD.return_date IS NULL 
       AND NEW.due_date < NEW.return_date THEN
        SET days_overdue = DATEDIFF(NEW.return_date, NEW.due_date);
        IF days_overdue > 0 THEN
            UPDATE borrow_records 
            SET fine_amount = days_overdue * fine_per_day 
            WHERE id = NEW.id;
            
            INSERT INTO fines (user_id, borrow_record_id, amount, reason)
            VALUES (NEW.user_id, NEW.id, 
                    days_overdue * fine_per_day, 
                    CONCAT('Late return - ', days_overdue, ' days overdue'));
        END IF;
    END IF;
END;
\`\`\`

---

## Error Handling and Notifications

### Error Handling Strategy

#### Client-Side Error Handling

**API Request Errors**:
\`\`\`typescript
try {
  const response = await apiService.borrowBook(userId, bookId)
  // Success handling
} catch (error) {
  console.error("[v0] API request error:", error)
  // Display user-friendly error message
  toast.error("Failed to borrow book. Please try again.")
}
\`\`\`

**Common Error Scenarios**:
1. **Network Errors**: Connection timeout, no internet
2. **Authentication Errors**: Invalid credentials, session expired
3. **Validation Errors**: Missing required fields, invalid data format
4. **Authorization Errors**: Insufficient permissions
5. **Resource Not Found**: Book/user doesn't exist
6. **Conflict Errors**: Book already borrowed, duplicate request

#### Server-Side Error Handling

**API Response Format**:
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "details": {}
}
\`\`\`

**HTTP Status Codes**:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `500 Internal Server Error`: Server error

#### Error Recovery Strategies

1. **Retry Logic**: Automatic retry for transient failures
2. **Fallback Mechanisms**: Alternative data sources when primary fails
3. **Graceful Degradation**: Partial functionality when services unavailable
4. **User Feedback**: Clear error messages with actionable steps

### Notification System

#### Notification Types

1. **System Notifications**:
   - In-app alerts and messages
   - Real-time updates
   - Toast notifications

2. **Email Notifications** (Configurable):
   - Account approval/rejection
   - Borrow request approval/rejection
   - Due date reminders (3 days before)
   - Overdue alerts
   - Fine notifications
   - Book request status updates

3. **SMS Notifications** (Future):
   - Critical alerts
   - Due date reminders
   - Overdue notifications

#### Notification Triggers

| Event | Notification Type | Recipients | Content |
|-------|------------------|------------|---------|
| User Registration | System | Librarians | New user pending approval |
| Account Approved | Email + System | Student | Account activated |
| Account Rejected | Email + System | Student | Rejection reason |
| Borrow Request | System | Librarians | New borrow request |
| Borrow Approved | Email + System | Student | Book ready for pickup |
| Borrow Rejected | Email + System | Student | Rejection reason |
| Due Date Reminder | Email + SMS | Student | Book due in 3 days |
| Overdue Alert | Email + SMS | Student | Book overdue, fine accruing |
| Fine Created | Email + System | Student | Fine amount and reason |
| Fine Paid | System | Student | Payment confirmation |
| Book Request Approved | Email + System | Student | Request approved |
| Book Available | Email + System | Student | Requested book now available |

#### Notification Delivery

**Implementation**:
\`\`\`typescript
// Create notification record
await apiService.createNotification({
  user_id: userId,
  type: 'email',
  subject: 'Book Due Soon',
  message: `Your book "${bookTitle}" is due on ${dueDate}`,
  status: 'pending'
})

// Background job processes pending notifications
// Sends via configured email/SMS service
// Updates status to 'sent' or 'failed'
\`\`\`

**Notification Preferences** (Future):
- User-configurable notification settings
- Opt-in/opt-out for specific notification types
- Preferred delivery method (email/SMS/both)
- Notification frequency settings

---

## Security and Authentication

### Authentication Flow

#### Login Process
\`\`\`
┌─────────────────┐
│ User enters     │
│ email/password  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Client validates input              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /auth/login.php                │
│ { email, password }                 │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Server validates credentials        │
│ - Check email exists                │
│ - Verify password hash              │
│ - Check account active/approved     │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────────────┐
│Success │ │Failure             │
└───┬────┘ └───┬────────────────┘
    │          │
    │          ▼
    │     ┌────────────────────┐
    │     │Return error        │
    │     │message             │
    │     └────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Server returns user data            │
│ { success, user, token }            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Client stores in localStorage:      │
│ - currentUser                       │
│ - authToken (if implemented)        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Redirect to dashboard               │
└─────────────────────────────────────┘
\`\`\`

#### Session Management

**Current Implementation**:
- Session data stored in browser localStorage
- User object contains: id, email, name, role, studentId
- Session persists until logout or browser clear

**Security Considerations**:
- Passwords should be hashed using bcrypt or similar
- Implement session timeout (e.g., 24 hours)
- Add CSRF protection for state-changing operations
- Use HTTPS for all communications

**Recommended Improvements**:
1. Implement JWT tokens for stateless authentication
2. Add refresh token mechanism
3. Implement session expiration
4. Add "Remember Me" functionality
5. Multi-factor authentication for librarians

### Role-Based Access Control (RBAC)

#### Implementation

**AuthGuard Component**:
\`\`\`typescript
export function AuthGuard({ 
  children, 
  requireAdmin = false 
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  
  // Check authentication
  if (!user) {
    return <LoginForm />
  }
  
  // Check authorization
  if (requireAdmin && user.role !== 'librarian') {
    return <AccessDenied />
  }
  
  return <>{children}</>
}
\`\`\`

**Route Protection**:
\`\`\`typescript
// Public route (no auth required)
export default function PublicPage() {
  return <Content />
}

// Protected route (auth required)
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  )
}

// Admin route (librarian only)
export default function AdminPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminContent />
    </AuthGuard>
  )
}
\`\`\`

#### Permission Matrix

| Feature | Student | Librarian |
|---------|---------|-----------|
| View Books | ✅ | ✅ |
| Request Borrow | ✅ | ✅ |
| View Own History | ✅ | ✅ |
| View Own Fines | ✅ | ✅ |
| Request New Books | ✅ | ✅ |
| Approve Borrows | ❌ | ✅ |
| Approve Users | ❌ | ✅ |
| Manage Books | ❌ | ✅ |
| Manage Users | ❌ | ✅ |
| View All History | ❌ | ✅ |
| Manage Fines | ❌ | ✅ |
| Generate Reports | ❌ | ✅ |
| View Analytics | ❌ | ✅ |

### Data Security

#### Input Validation

**Client-Side**:
- Form validation using React Hook Form
- Type checking with TypeScript
- Sanitization of user inputs

**Server-Side**:
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- Input length limits
- Data type validation

#### Password Security

**Requirements**:
- Minimum 8 characters
- Mix of letters and numbers (recommended)
- Hashed using bcrypt (recommended)
- Salt rounds: 10+ (recommended)

**Current Implementation**:
\`\`\`typescript
// Client stores plain password (NOT SECURE)
// RECOMMENDATION: Hash on server before storage
\`\`\`

**Recommended Implementation**:
\`\`\`php
// Server-side password hashing
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Password verification
if (password_verify($inputPassword, $hashedPassword)) {
    // Login successful
}
\`\`\`

#### API Security

**Current Measures**:
- CORS configuration
- Content-Type validation
- Request method validation

**Recommended Additions**:
1. **API Rate Limiting**: Prevent abuse
2. **Request Signing**: Verify request integrity
3. **API Keys**: For third-party integrations
4. **IP Whitelisting**: For admin operations
5. **Audit Logging**: Track all API calls

### Data Privacy

#### Personal Information Protection

**Stored Data**:
- Email addresses
- Phone numbers
- Physical addresses
- Birth dates
- Student IDs

**Protection Measures**:
- Access restricted by role
- Audit trail for data access
- Data retention policies
- Right to deletion (GDPR compliance)

#### Compliance Considerations

**GDPR (if applicable)**:
- User consent for data collection
- Right to access personal data
- Right to deletion
- Data portability
- Privacy policy

**FERPA (for educational institutions)**:
- Student record protection
- Parental access rights
- Disclosure limitations

---

## Deployment and Maintenance

### Server Requirements

#### Frontend (Vercel)
- **Platform**: Vercel (Next.js optimized)
- **Node.js**: v18.17 or higher
- **Memory**: 512MB minimum
- **Build Time**: ~2-3 minutes
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Backend API base URL

#### Backend (Hostinger)
- **Platform**: Shared hosting with PHP support
- **PHP Version**: 7.4 or higher
- **MySQL**: 5.7 or higher
- **Disk Space**: 500MB minimum
- **Memory**: 128MB minimum
- **Extensions Required**:
  - mysqli
  - json
  - pdo_mysql

#### Database (MySQL)
- **Version**: MySQL 8.0+ or MariaDB 10.5+
- **Storage**: 1GB minimum (scales with data)
- **Connections**: 10 concurrent minimum
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

### Deployment Steps

#### Initial Setup

**1. Database Setup**:
\`\`\`bash
# Connect to MySQL
mysql -u username -p

# Run schema creation
mysql -u username -p database_name < scripts/mysql-schema.sql

# Run enhancement scripts
mysql -u username -p database_name < scripts/add-enhancements.sql
mysql -u username -p database_name < scripts/add-borrow-approval.sql
mysql -u username -p database_name < scripts/add-user-approval-fields.sql
mysql -u username -p database_name < scripts/analytics-views.sql
mysql -u username -p database_name < scripts/recommender-tables.sql

# Seed initial data (optional)
# Run seed-database.ts script
\`\`\`

**2. Backend Deployment**:
\`\`\`bash
# Upload PHP files to Hostinger
# Via FTP or File Manager:
# - /api/auth/*.php
# - /api/books/*.php
# - /api/borrow/*.php
# - /api/users/*.php
# - /api/analytics/*.php
# - /api/fines/*.php

# Configure database connection
# Edit config.php with database credentials
\`\`\`

**3. Frontend Deployment**:
\`\`\`bash
# Install dependencies
npm install

# Set environment variables in Vercel
# NEXT_PUBLIC_API_URL=https://gray-skunk-937601.hostingersite.com/api

# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for automatic deployments
\`\`\`

#### Environment Configuration

**Vercel Environment Variables**:
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NODE_ENV=production
\`\`\`

**Backend Configuration** (config.php):
\`\`\`php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'library_system');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_CHARSET', 'utf8mb4');

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
?>
\`\`\`

### Backup Procedures

#### Database Backup

**Automated Daily Backup**:
\`\`\`bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/library_system"
DB_NAME="library_system"
DB_USER="username"
DB_PASS="password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
\`\`\`

**Schedule with cron**:
\`\`\`bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-database.sh
\`\`\`

#### File Backup

**Backend Files**:
\`\`\`bash
# Backup PHP files
tar -czf api_backup_$(date +%Y%m%d).tar.gz /path/to/api/

# Upload to cloud storage (optional)
# aws s3 cp api_backup_*.tar.gz s3://your-bucket/backups/
\`\`\`

**Frontend Build**:
- Vercel maintains deployment history
- GitHub repository serves as source backup
- Download production build if needed

### Maintenance Tasks

#### Daily Tasks
- Monitor error logs
- Check system performance
- Review new user registrations
- Check overdue books

#### Weekly Tasks
- Review backup integrity
- Check disk space usage
- Review API performance metrics
- Update overdue fines

#### Monthly Tasks
- Database optimization (OPTIMIZE TABLE)
- Review and archive old records
- Security updates check
- Performance analysis
- User feedback review

#### Quarterly Tasks
- Full system backup verification
- Security audit
- Dependency updates
- Feature usage analysis
- Capacity planning

### Monitoring and Logging

#### Application Monitoring

**Frontend (Vercel)**:
- Vercel Analytics for performance
- Error tracking with console logs
- User session monitoring

**Backend**:
- PHP error logs
- MySQL slow query log
- API request logging

**Recommended Tools**:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging
- **New Relic**: Application performance monitoring
- **Uptime Robot**: Uptime monitoring

#### Log Management

**Log Locations**:
\`\`\`
Frontend: Vercel Dashboard → Logs
Backend: /var/log/php_errors.log
Database: /var/log/mysql/error.log
\`\`\`

**Log Rotation**:
\`\`\`bash
# /etc/logrotate.d/library-system
/var/log/library-system/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
\`\`\`

### Troubleshooting Guide

#### Common Issues

**1. API Connection Errors**:
\`\`\`
Error: Failed to fetch
Solution: 
- Check NEXT_PUBLIC_API_URL environment variable
- Verify backend server is running
- Check CORS configuration
- Verify network connectivity
\`\`\`

**2. Database Connection Errors**:
\`\`\`
Error: Access denied for user
Solution:
- Verify database credentials in config.php
- Check MySQL user permissions
- Ensure database exists
- Check MySQL service status
\`\`\`

**3. Authentication Issues**:
\`\`\`
Error: User not found / Invalid credentials
Solution:
- Verify user exists in database
- Check password hashing implementation
- Clear browser localStorage
- Check session expiration
\`\`\`

**4. Book Availability Issues**:
\`\`\`
Error: Book not available
Solution:
- Check available_copies count
- Verify no pending borrows
- Check for data inconsistencies
- Run inventory reconciliation
\`\`\`

**5. Fine Calculation Errors**:
\`\`\`
Error: Incorrect fine amount
Solution:
- Verify trigger is active
- Check due_date and return_date
- Verify fine_per_day rate
- Manually recalculate if needed
\`\`\`

---

## Future Enhancements

### Short-Term Improvements (3-6 months)

#### 1. Mobile Application
**Description**: Native mobile apps for iOS and Android

**Features**:
- Browse and search books
- Scan ISBN barcodes
- Push notifications for due dates
- Mobile-optimized interface
- Offline mode for viewing borrowed books

**Technology Stack**:
- React Native or Flutter
- Same backend API
- Firebase Cloud Messaging for notifications

#### 2. Barcode/QR Code Scanning
**Description**: Streamline book checkout and return process

**Features**:
- Generate QR codes for library cards
- Barcode scanning for book ISBN
- Quick checkout with QR scan
- Inventory management with barcode scanner
- Self-service kiosks

**Implementation**:
- QR code generation library
- Camera API integration
- Barcode scanner hardware support

#### 3. Enhanced Notification System
**Description**: Comprehensive notification delivery

**Features**:
- SMS notifications via Twilio
- Email templates with branding
- In-app notification center
- Notification preferences
- Digest emails (weekly summary)

**Integration**:
- Twilio for SMS
- SendGrid for email
- Web Push API for browser notifications

### Medium-Term Enhancements (6-12 months)

#### 4. AI Recommendation Engine
**Description**: Personalized book recommendations

**Features**:
- Collaborative filtering based on borrowing history
- Content-based recommendations
- "Users who borrowed this also borrowed..."
- Genre preference learning
- Reading level suggestions

**Technology**:
- Machine learning models (TensorFlow.js)
- Recommendation algorithms
- User behavior tracking
- A/B testing for recommendations

**Database Schema** (Already Prepared):
\`\`\`sql
-- recommender-tables.sql
CREATE TABLE user_preferences (
    user_id INT,
    genre VARCHAR(100),
    preference_score FLOAT
);

CREATE TABLE book_similarities (
    book_id_1 INT,
    book_id_2 INT,
    similarity_score FLOAT
);
\`\`\`

#### 5. Advanced Analytics Dashboard
**Description**: Comprehensive library insights

**Features**:
- Predictive analytics for book demand
- User engagement metrics
- Collection gap analysis
- Budget optimization recommendations
- Trend forecasting

**Visualizations**:
- Interactive charts (Chart.js, D3.js)
- Heat maps for popular times
- Geographic distribution
- Demographic analysis

#### 6. Digital Library Integration
**Description**: E-book and audiobook support

**Features**:
- E-book lending (OverDrive API)
- Audiobook streaming
- Digital rights management
- Reading progress tracking
- Annotation and highlighting

**Integrations**:
- OverDrive API
- Libby integration
- Adobe Digital Editions

### Long-Term Vision (12+ months)

#### 7. Multi-Library Network
**Description**: Connect multiple library branches

**Features**:
- Inter-library loan system
- Unified catalog search
- Book transfer requests
- Shared user accounts
- Network-wide analytics

**Architecture**:
- Microservices architecture
- Distributed database
- Message queue for synchronization
- API gateway

#### 8. Community Features
**Description**: Social features for readers

**Features**:
- Book reviews and ratings
- Reading clubs and discussions
- User-generated book lists
- Reading challenges
- Social sharing

**Implementation**:
- Comment system
- Rating aggregation
- Social media integration
- Gamification elements

#### 9. Accessibility Improvements
**Description**: Make system accessible to all users

**Features**:
- Screen reader optimization
- High contrast mode
- Font size adjustment
- Keyboard navigation
- Multi-language support
- Text-to-speech for descriptions

**Standards**:
- WCAG 2.1 Level AA compliance
- ARIA labels
- Semantic HTML
- Internationalization (i18n)

#### 10. Cloud Infrastructure Migration
**Description**: Scalable cloud hosting

**Benefits**:
- Auto-scaling for traffic spikes
- Global CDN for faster access
- Automated backups
- Disaster recovery
- 99.9% uptime SLA

**Platforms**:
- AWS (EC2, RDS, S3, CloudFront)
- Google Cloud Platform
- Azure

**Migration Strategy**:
1. Set up cloud infrastructure
2. Migrate database to cloud RDS
3. Deploy backend to cloud servers
4. Configure CDN for static assets
5. Implement load balancing
6. Set up monitoring and alerts
7. Gradual traffic migration
8. Decommission old infrastructure

#### 11. Advanced Security Features
**Description**: Enterprise-grade security

**Features**:
- Two-factor authentication (2FA)
- Single Sign-On (SSO) integration
- Biometric authentication (mobile)
- Security audit logs
- Intrusion detection
- Data encryption at rest

**Implementation**:
- OAuth 2.0 / OpenID Connect
- TOTP for 2FA
- AES-256 encryption
- Security Information and Event Management (SIEM)

#### 12. Reporting and Export Tools
**Description**: Advanced reporting capabilities

**Features**:
- Custom report builder
- Scheduled report generation
- Export to multiple formats (PDF, Excel, CSV)
- Report templates
- Data visualization builder
- Automated email delivery

**Technology**:
- Report generation libraries
- PDF generation (jsPDF, PDFKit)
- Excel export (ExcelJS)
- Scheduled jobs (cron, node-cron)

---

## Appendix

### Glossary

- **Accession Number**: Unique identifier for each physical copy of a book
- **Borrow Record**: Database record tracking a book borrowing transaction
- **Due Date**: Date by which a borrowed book must be returned
- **Fine**: Monetary penalty for late book return
- **ISBN**: International Standard Book Number
- **Librarian**: Staff member with administrative privileges
- **Patron**: Library user (student)
- **Renewal**: Extension of borrowing period
- **Reservation**: Request to borrow a book when it becomes available
- **Soft Delete**: Marking record as deleted without removing from database

### Acronyms

- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **CORS**: Cross-Origin Resource Sharing
- **ERD**: Entity Relationship Diagram
- **FK**: Foreign Key
- **GDPR**: General Data Protection Regulation
- **JWT**: JSON Web Token
- **PK**: Primary Key
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **SQL**: Structured Query Language
- **UI**: User Interface
- **UX**: User Experience

### Contact Information

**Technical Support**:
- Email: support@libraryhub.com
- Phone: +1-XXX-XXX-XXXX
- Hours: Monday-Friday, 9 AM - 5 PM

**Development Team**:
- Lead Developer: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- Database Administrator: [Name]

**Documentation**:
- Last Updated: January 2025
- Version: 1.0
- Next Review: April 2025

---

## Conclusion

This Library Management System provides a comprehensive solution for modern library operations, combining user-friendly interfaces with powerful administrative tools. The system is designed to scale with your institution's needs while maintaining security, reliability, and performance.

For questions, support, or feature requests, please contact the development team or refer to the technical support channels listed above.

**Thank you for using LibraryHub!**
