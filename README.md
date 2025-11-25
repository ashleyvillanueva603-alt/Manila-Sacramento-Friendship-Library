# Manila Sacramento Friendship Library

A modern, full-featured library management system built with Next.js, featuring role-based access control for both students and librarians. The system provides a comprehensive solution for managing book collections, tracking borrowing activities, and generating detailed analytics.

## Features

### For Students
- **Browse Collection** - Search and explore the library's book catalog
- **Book Management** - View currently borrowed books and due dates
- **Reading History** - Track complete borrowing history
- **Book Requests** - Submit requests for new books to be added
- **Profile Management** - Manage account details and preferences

### For Librarians
- **Analytics Dashboard** - View comprehensive library statistics and insights
- **Book Collection Management** - Add, edit, and organize library inventory
- **Student Management** - Manage student accounts and memberships
- **Request Processing** - Review and approve book requests
- **Borrowing History** - Access complete transaction records
- **Advanced Analytics** - Deep insights with trend analysis and reporting

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Database**: Dexie.js (IndexedDB wrapper)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd library-system
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

**Librarian Account:**
- Email: librarian@library.com
- Password: librarian123

**Student Account:**
- Email: student@library.com
- Password: student123

## Project Structure

\`\`\`
├── app/                      # Next.js app directory
│   ├── admin/               # Librarian admin pages
│   │   ├── analytics/       # Advanced analytics
│   │   ├── books/          # Book management
│   │   ├── borrowing/      # Borrowing management
│   │   ├── dashboard/      # Main dashboard
│   │   ├── history/        # Transaction history
│   │   ├── requests/       # Book requests
│   │   └── users/          # User management
│   ├── books/              # Public book browsing
│   ├── my-books/           # Student's borrowed books
│   ├── my-history/         # Student's history
│   ├── profile/            # User profile
│   ├── request-book/       # Book request form
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/
│   ├── auth/               # Authentication components
│   ├── camera/             # Camera capture functionality
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── use-auth.tsx        # Authentication hook
│   ├── use-mobile.tsx      # Mobile detection
│   └── use-toast.ts        # Toast notifications
├── lib/
│   ├── database.ts         # Dexie database setup
│   ├── api-service.ts      # API service layer
│   ├── google-books-api.ts # Google Books integration
│   └── utils.ts            # Utility functions
└── scripts/                # Database seeding scripts
\`\`\`

## Key Features Explained

### Role-Based Access Control
The system uses a custom authentication hook (`use-auth.tsx`) that manages user sessions and enforces role-based permissions. Librarians have access to admin routes while students access their personal features.

### Database Management
Built on Dexie.js for client-side storage with:
- **Books** - Complete catalog with metadata
- **Users** - Student and librarian accounts
- **Borrow Records** - Transaction tracking
- **Book Requests** - Student suggestions

### Analytics & Reporting
Librarians can:
- View real-time statistics
- Track borrowing trends
- Generate PDF reports
- Monitor overdue books
- Analyze popular titles

### Google Books Integration
Automatically fetch book metadata including:
- Cover images
- Descriptions
- Author information
- ISBN details

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

### Environment Variables

This project runs entirely client-side with IndexedDB, so no environment variables are required for basic functionality. Optional integrations may require additional configuration.

## Design System

The application uses a cohesive design system with:
- **Primary Color**: Emerald Green (#059669)
- **Secondary Color**: Light Green (#10b981)
- **Typography**: Inter (body) + JetBrains Mono (monospace)
- **Dark Mode**: Full dark mode support
- **Animations**: Smooth transitions and hover effects

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is built for educational purposes.

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and modern web technologies
