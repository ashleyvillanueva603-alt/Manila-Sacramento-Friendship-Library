import Dexie, { type EntityTable } from "dexie"

// Database interfaces
export interface User {
  id?: number
  email: string
  password: string
  name: string
  role: "librarian" | "student"
  createdAt: Date
  isActive: boolean
  studentId?: string
  phoneNumber?: string
  address?: string
  profilePicture?: string
  libraryCardNumber?: string
  fineAmount?: number
  approved?: boolean
  approvedAt?: Date
  approvedBy?: number
  educationLevel?: string
  school?: string
  professionalCategory?: string
  age?: number
  sex?: string
  birthDate?: string
}

export interface Book {
  id?: number
  title: string
  author: string
  isbn: string
  accessionNumber?: string // Added accession number for unique copy tracking
  genre: string
  description: string
  publishedYear: number
  totalCopies: number
  availableCopies: number
  coverUrl?: string
  createdAt: Date
  googleBooksId?: string
  publisher?: string
  pageCount?: number
  language?: string
  categories?: string[]
}

export interface BorrowRecord {
  id?: number
  userId: number
  bookId: number
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  status: "borrowed" | "returned" | "overdue" | "pending"
  approved?: boolean
  approvedAt?: Date
  approvedBy?: number
  renewalCount: number
  fineAmount?: number
  finePaid?: boolean
}

export interface Reservation {
  id?: number
  userId: number
  bookId: number
  reservationDate: Date
  status: "active" | "fulfilled" | "cancelled"
}

export interface BookRequest {
  id?: number
  userId: number
  bookTitle: string
  author?: string
  isbn?: string
  reason: string
  status: "pending" | "approved" | "rejected" | "fulfilled"
  requestDate: Date
  responseDate?: Date
  librarianNotes?: string
}

export interface Fine {
  id?: number
  userId: number
  borrowRecordId: number
  amount: number
  reason: string
  status: "pending" | "paid" | "waived"
  createdDate: Date
  paidDate?: Date
  paymentMethod?: string
}

export interface Notification {
  id?: number
  userId: number
  type: "email" | "sms" | "system"
  subject: string
  message: string
  status: "pending" | "sent" | "failed"
  createdDate: Date
  sentDate?: Date
}

// Database class
class LibraryDatabase extends Dexie {
  users!: EntityTable<User, "id">
  books!: EntityTable<Book, "id">
  borrowRecords!: EntityTable<BorrowRecord, "id">
  reservations!: EntityTable<Reservation, "id">
  bookRequests!: EntityTable<BookRequest, "id">
  fines!: EntityTable<Fine, "id">
  notifications!: EntityTable<Notification, "id">

  constructor() {
    super("LibraryDatabase")

    this.version(2).stores({
      users:
        "++id, email, role, isActive, studentId, libraryCardNumber, name, approved, educationLevel, school, professionalCategory, age, sex, birthDate",
      books: "++id, title, author, isbn, accessionNumber, genre, googleBooksId, [title+author]",
      borrowRecords: "++id, userId, bookId, status, dueDate, borrowDate, approved, [userId+status]",
      reservations: "++id, userId, bookId, status, [userId+status]",
      bookRequests: "++id, userId, status, requestDate, [userId+status]",
      fines: "++id, userId, borrowRecordId, status, createdDate, [userId+status]",
      notifications: "++id, userId, type, status, createdDate, [userId+type]",
    })
  }
}

export const db = new LibraryDatabase()

// Initialize with sample data
export async function initializeDatabase() {
  const userCount = await db.users.count()

  if (userCount === 0) {
    await db.users.add({
      email: "librarian@library.com",
      password: "librarian123", // In production, this should be hashed
      name: "Library Administrator",
      role: "librarian",
      createdAt: new Date(),
      isActive: true,
      phoneNumber: "+1234567890",
      address: "Library Main Office",
      approved: true,
      approvedAt: new Date(),
    })

    await db.users.add({
      email: "student@example.com",
      password: "student123",
      name: "John Doe",
      role: "student",
      createdAt: new Date(),
      isActive: true,
      studentId: "STU001",
      phoneNumber: "+1234567891",
      address: "123 Student St, City",
      libraryCardNumber: "LIB001",
      fineAmount: 0,
      approved: true,
      approvedAt: new Date(),
      educationLevel: "college",
      school: "Sample University",
      age: 20,
      sex: "male",
      birthDate: "2004-01-15",
    })

    const sampleBooks = [
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        genre: "Classic",
        description: "A gripping tale of racial injustice and childhood innocence in the American South.",
        publishedYear: 1960,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "J.B. Lippincott & Co.",
        pageCount: 376,
        language: "English",
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        genre: "Dystopian",
        description: "A dystopian social science fiction novel about totalitarian control.",
        publishedYear: 1949,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Secker & Warburg",
        pageCount: 328,
        language: "English",
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "978-0-14-143951-8",
        genre: "Romance",
        description: "A romantic novel of manners set in Georgian England.",
        publishedYear: 1813,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "T. Egerton",
        pageCount: 432,
        language: "English",
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        genre: "Classic",
        description: "A critique of the American Dream set in the Jazz Age.",
        publishedYear: 1925,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Charles Scribner's Sons",
        pageCount: 180,
        language: "English",
      },
      {
        title: "One Hundred Years of Solitude",
        author: "Gabriel García Márquez",
        isbn: "978-0-06-088328-7",
        genre: "Magical Realism",
        description: "A multi-generational story of the Buendía family.",
        publishedYear: 1967,
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        publisher: "Harper & Row",
        pageCount: 417,
        language: "English",
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0-316-76948-0",
        genre: "Classic",
        description: "A controversial novel about teenage rebellion and alienation.",
        publishedYear: 1951,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Little, Brown and Company",
        pageCount: 277,
        language: "English",
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        isbn: "978-0-547-92822-7",
        genre: "Fantasy",
        description: "A fantasy adventure about Bilbo Baggins and his unexpected journey.",
        publishedYear: 1937,
        totalCopies: 7,
        availableCopies: 7,
        createdAt: new Date(),
        publisher: "George Allen & Unwin",
        pageCount: 310,
        language: "English",
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        isbn: "978-0-441-17271-9",
        genre: "Science Fiction",
        description: "A science fiction epic set on the desert planet Arrakis.",
        publishedYear: 1965,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Chilton Books",
        pageCount: 688,
        language: "English",
      },
      {
        title: "Foundation",
        author: "Isaac Asimov",
        isbn: "978-0-553-29335-0",
        genre: "Science Fiction",
        description: "The first novel in Asimov's Foundation series.",
        publishedYear: 1951,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Gnome Press",
        pageCount: 244,
        language: "English",
      },
      {
        title: "The Girl with the Dragon Tattoo",
        author: "Stieg Larsson",
        isbn: "978-0-307-45454-1",
        genre: "Mystery",
        description: "A psychological thriller about a journalist and a hacker.",
        publishedYear: 2005,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Norstedts Förlag",
        pageCount: 590,
        language: "English",
      },
      {
        title: "Gone Girl",
        author: "Gillian Flynn",
        isbn: "978-0-307-58836-4",
        genre: "Thriller",
        description: "A psychological thriller about a marriage gone wrong.",
        publishedYear: 2012,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Crown Publishing Group",
        pageCount: 419,
        language: "English",
      },
      {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        isbn: "978-0-385-50420-1",
        genre: "Thriller",
        description: "A mystery thriller involving art, history, and religion.",
        publishedYear: 2003,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Doubleday",
        pageCount: 454,
        language: "English",
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        isbn: "978-0-06-231609-7",
        genre: "History",
        description: "A brief history of humankind from the Stone Age to the present.",
        publishedYear: 2011,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Harvill Secker",
        pageCount: 443,
        language: "English",
      },
      {
        title: "Educated",
        author: "Tara Westover",
        isbn: "978-0-399-59050-4",
        genre: "Memoir",
        description: "A memoir about education and family in rural Idaho.",
        publishedYear: 2018,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Random House",
        pageCount: 334,
        language: "English",
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        isbn: "978-0-374-27563-1",
        genre: "Psychology",
        description: "A book about the two systems that drive the way we think.",
        publishedYear: 2011,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Farrar, Straus and Giroux",
        pageCount: 499,
        language: "English",
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        isbn: "978-0-06-112241-5",
        genre: "Philosophy",
        description: "A philosophical novel about following one's dreams.",
        publishedYear: 1988,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "HarperCollins",
        pageCount: 163,
        language: "English",
      },
      {
        title: "Becoming",
        author: "Michelle Obama",
        isbn: "978-1-5247-6313-8",
        genre: "Biography",
        description: "The memoir of former First Lady Michelle Obama.",
        publishedYear: 2018,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Crown Publishing Group",
        pageCount: 448,
        language: "English",
      },
      {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "978-0-553-38016-3",
        genre: "Science",
        description: "A landmark volume in science writing about cosmology.",
        publishedYear: 1988,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Bantam Books",
        pageCount: 256,
        language: "English",
      },
      {
        title: "The Selfish Gene",
        author: "Richard Dawkins",
        isbn: "978-0-19-929114-4",
        genre: "Science",
        description: "A book on evolution that popularized the gene-centered view.",
        publishedYear: 1976,
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        publisher: "Oxford University Press",
        pageCount: 360,
        language: "English",
      },
      {
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        isbn: "978-0-345-39180-3",
        genre: "Science Fiction",
        description: "A comedic science fiction series about space travel.",
        publishedYear: 1979,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Pan Books",
        pageCount: 224,
        language: "English",
      },
      {
        title: "Ender's Game",
        author: "Orson Scott Card",
        isbn: "978-0-812-55070-2",
        genre: "Science Fiction",
        description: "A military science fiction novel about child soldiers.",
        publishedYear: 1985,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Tor Books",
        pageCount: 324,
        language: "English",
      },
      {
        title: "And Then There Were None",
        author: "Agatha Christie",
        isbn: "978-0-06-207348-4",
        genre: "Mystery",
        description: "A classic mystery novel about ten strangers on an island.",
        publishedYear: 1939,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Collins Crime Club",
        pageCount: 272,
        language: "English",
      },
      {
        title: "The Silence of the Lambs",
        author: "Thomas Harris",
        isbn: "978-0-312-92458-5",
        genre: "Thriller",
        description: "A psychological horror thriller about FBI agent Clarice Starling.",
        publishedYear: 1988,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "St. Martin's Press",
        pageCount: 352,
        language: "English",
      },
      {
        title: "The Immortal Life of Henrietta Lacks",
        author: "Rebecca Skloot",
        isbn: "978-1-4000-5217-2",
        genre: "Science",
        description: "The story of HeLa cells and their impact on medical research.",
        publishedYear: 2010,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Crown Publishing Group",
        pageCount: 381,
        language: "English",
      },
      {
        title: "The Power of Habit",
        author: "Charles Duhigg",
        isbn: "978-1-4000-6928-6",
        genre: "Self-Help",
        description: "Why we do what we do in life and business.",
        publishedYear: 2012,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Random House",
        pageCount: 371,
        language: "English",
      },
      {
        title: "The Kite Runner",
        author: "Khaled Hosseini",
        isbn: "978-1-59448-000-3",
        genre: "Historical Fiction",
        description: "A story of friendship and redemption set in Afghanistan.",
        publishedYear: 2003,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Riverhead Books",
        pageCount: 371,
        language: "English",
      },
      {
        title: "Life of Pi",
        author: "Yann Martel",
        isbn: "978-0-15-100811-7",
        genre: "Adventure",
        description: "A philosophical novel about a boy stranded on a lifeboat with a tiger.",
        publishedYear: 2001,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Knopf Canada",
        pageCount: 319,
        language: "English",
      },
      {
        title: "The Book Thief",
        author: "Markus Zusak",
        isbn: "978-0-375-83100-3",
        genre: "Historical Fiction",
        description: "A story narrated by Death about a girl living in Nazi Germany.",
        publishedYear: 2005,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Picador",
        pageCount: 552,
        language: "English",
      },
      {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        isbn: "978-0-7352-1909-0",
        genre: "Mystery",
        description: "A mystery and coming-of-age story set in the marshes of North Carolina.",
        publishedYear: 2018,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "G.P. Putnam's Sons",
        pageCount: 370,
        language: "English",
      },
      {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        isbn: "978-1-5011-3981-2",
        genre: "Historical Fiction",
        description: "A reclusive Hollywood icon tells her life story to a young journalist.",
        publishedYear: 2017,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Atria Books",
        pageCount: 400,
        language: "English",
      },
      {
        title: "The Subtle Art of Not Giving a F*ck",
        author: "Mark Manson",
        isbn: "978-0-06-245771-4",
        genre: "Self-Help",
        description: "A counterintuitive approach to living a good life.",
        publishedYear: 2016,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "HarperOne",
        pageCount: 224,
        language: "English",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "978-0-7352-1129-2",
        genre: "Self-Help",
        description: "An easy and proven way to build good habits and break bad ones.",
        publishedYear: 2018,
        totalCopies: 7,
        availableCopies: 7,
        createdAt: new Date(),
        publisher: "Avery",
        pageCount: 320,
        language: "English",
      },
      {
        title: "Freakonomics",
        author: "Steven D. Levitt",
        isbn: "978-0-06-073132-6",
        genre: "Economics",
        description: "A rogue economist explores the hidden side of everything.",
        publishedYear: 2005,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "William Morrow",
        pageCount: 315,
        language: "English",
      },
      {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        isbn: "978-1-4516-4853-4",
        genre: "Biography",
        description: "The exclusive biography of Apple's co-founder.",
        publishedYear: 2011,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Simon & Schuster",
        pageCount: 656,
        language: "English",
      },
      {
        title: "The Color Purple",
        author: "Alice Walker",
        isbn: "978-0-15-119154-4",
        genre: "Classic",
        description: "An epistolary novel about African American women in the South.",
        publishedYear: 1982,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Harcourt Brace Jovanovich",
        pageCount: 295,
        language: "English",
      },
      {
        title: "One Flew Over the Cuckoo's Nest",
        author: "Ken Kesey",
        isbn: "978-0-14-118123-4",
        genre: "Classic",
        description: "A novel set in a mental institution in Oregon.",
        publishedYear: 1962,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Viking Press",
        pageCount: 325,
        language: "English",
      },
      {
        title: "The Sun Also Rises",
        author: "Ernest Hemingway",
        isbn: "978-0-684-80071-9",
        genre: "Classic",
        description: "A novel about American and British expatriates in Europe.",
        publishedYear: 1926,
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        publisher: "Charles Scribner's Sons",
        pageCount: 251,
        language: "English",
      },
      {
        title: "The Fault in Our Stars",
        author: "John Green",
        isbn: "978-0-525-47881-2",
        genre: "Young Adult",
        description: "A love story between two teenagers with cancer.",
        publishedYear: 2012,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Dutton Books",
        pageCount: 313,
        language: "English",
      },
      {
        title: "The Hunger Games",
        author: "Suzanne Collins",
        isbn: "978-0-439-02348-1",
        genre: "Young Adult",
        description: "A dystopian novel about a televised fight to the death.",
        publishedYear: 2008,
        totalCopies: 8,
        availableCopies: 8,
        createdAt: new Date(),
        publisher: "Scholastic Press",
        pageCount: 374,
        language: "English",
      },
      {
        title: "Twilight",
        author: "Stephenie Meyer",
        isbn: "978-0-316-01584-4",
        genre: "Young Adult",
        description: "A romance between a human girl and a vampire.",
        publishedYear: 2005,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Little, Brown and Company",
        pageCount: 498,
        language: "English",
      },
      {
        title: "Divergent",
        author: "Veronica Roth",
        isbn: "978-0-06-202402-2",
        genre: "Young Adult",
        description: "A dystopian novel about a society divided into factions.",
        publishedYear: 2011,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Katherine Tegen Books",
        pageCount: 487,
        language: "English",
      },
      {
        title: "Outliers",
        author: "Malcolm Gladwell",
        isbn: "978-0-316-01792-3",
        genre: "Psychology",
        description: "The story of success and what makes high-achievers different.",
        publishedYear: 2008,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Little, Brown and Company",
        pageCount: 309,
        language: "English",
      },
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        isbn: "978-0-307-88789-4",
        genre: "Business",
        description: "How today's entrepreneurs use continuous innovation.",
        publishedYear: 2011,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Crown Business",
        pageCount: 336,
        language: "English",
      },
      {
        title: "Catch-22",
        author: "Joseph Heller",
        isbn: "978-0-684-83339-9",
        genre: "Satire",
        description: "A satirical novel about World War II.",
        publishedYear: 1961,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Simon & Schuster",
        pageCount: 453,
        language: "English",
      },
      {
        title: "The Road",
        author: "Cormac McCarthy",
        isbn: "978-0-307-38789-9",
        genre: "Post-Apocalyptic",
        description: "A father and son's journey through a post-apocalyptic landscape.",
        publishedYear: 2006,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Alfred A. Knopf",
        pageCount: 287,
        language: "English",
      },
      {
        title: "Never Let Me Go",
        author: "Kazuo Ishiguro",
        isbn: "978-1-4000-7877-6",
        genre: "Science Fiction",
        description: "A dystopian science fiction novel about human clones.",
        publishedYear: 2005,
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        publisher: "Faber & Faber",
        pageCount: 288,
        language: "English",
      },
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        isbn: "978-0-525-55948-1",
        genre: "Fiction",
        description: "A novel about a library between life and death.",
        publishedYear: 2020,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Viking",
        pageCount: 288,
        language: "English",
      },
      {
        title: "The Martian",
        author: "Andy Weir",
        isbn: "978-0-553-41802-6",
        genre: "Science Fiction",
        description: "A story about an astronaut stranded on Mars.",
        publishedYear: 2011,
        totalCopies: 6,
        availableCopies: 6,
        createdAt: new Date(),
        publisher: "Crown Publishers",
        pageCount: 369,
        language: "English",
      },
      {
        title: "Ready Player One",
        author: "Ernest Cline",
        isbn: "978-0-307-88743-6",
        genre: "Science Fiction",
        description: "A dystopian science fiction novel set in a virtual reality world.",
        publishedYear: 2011,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Crown Publishers",
        pageCount: 374,
        language: "English",
      },
      {
        title: "The Giver",
        author: "Lois Lowry",
        isbn: "978-0-544-33626-0",
        genre: "Young Adult",
        description: "A dystopian novel about a society without pain or suffering.",
        publishedYear: 1993,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Houghton Mifflin",
        pageCount: 208,
        language: "English",
      },
      {
        title: "The Perks of Being a Wallflower",
        author: "Stephen Chbosky",
        isbn: "978-0-671-02734-6",
        genre: "Young Adult",
        description: "A coming-of-age epistolary novel.",
        publishedYear: 1999,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Pocket Books",
        pageCount: 213,
        language: "English",
      },
      {
        title: "Where the Red Fern Grows",
        author: "Wilson Rawls",
        isbn: "978-0-553-27429-1",
        genre: "Children's Literature",
        description: "A story about a boy and his hunting dogs.",
        publishedYear: 1961,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Doubleday",
        pageCount: 245,
        language: "English",
      },
      {
        title: "The Outsiders",
        author: "S.E. Hinton",
        isbn: "978-0-14-038572-4",
        genre: "Young Adult",
        description: "A coming-of-age novel about teenage gangs.",
        publishedYear: 1967,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Viking Press",
        pageCount: 192,
        language: "English",
      },
      {
        title: "The Innovator's Dilemma",
        author: "Clayton M. Christensen",
        isbn: "978-0-87584-585-2",
        genre: "Business",
        description: "When new technologies cause great firms to fail.",
        publishedYear: 1997,
        totalCopies: 2,
        availableCopies: 2,
        createdAt: new Date(),
        publisher: "Harvard Business Review Press",
        pageCount: 286,
        language: "English",
      },
      {
        title: "Slaughterhouse-Five",
        author: "Kurt Vonnegut",
        isbn: "978-0-385-31208-0",
        genre: "Satire",
        description: "An anti-war novel about Billy Pilgrim's experiences.",
        publishedYear: 1969,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Delacorte Press",
        pageCount: 275,
        language: "English",
      },
      {
        title: "The Remains of the Day",
        author: "Kazuo Ishiguro",
        isbn: "978-0-679-73172-5",
        genre: "Classic",
        description: "A novel about an English butler reflecting on his life.",
        publishedYear: 1989,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Faber & Faber",
        pageCount: 245,
        language: "English",
      },
      {
        title: "The Girl on the Train",
        author: "Paula Hawkins",
        isbn: "978-1-59463-366-6",
        genre: "Thriller",
        description:
          "A psychological thriller about a woman who becomes entangled in a missing person's investigation.",
        publishedYear: 2015,
        totalCopies: 5,
        availableCopies: 5,
        createdAt: new Date(),
        publisher: "Riverhead Books",
        pageCount: 336,
        language: "English",
      },
      {
        title: "Eleanor Oliphant Is Completely Fine",
        author: "Gail Honeyman",
        isbn: "978-0-7352-2894-8",
        genre: "Fiction",
        description: "A novel about a socially awkward woman learning to navigate relationships.",
        publishedYear: 2017,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "HarperCollins",
        pageCount: 327,
        language: "English",
      },
      {
        title: "A Man Called Ove",
        author: "Fredrik Backman",
        isbn: "978-1-4767-3802-1",
        genre: "Fiction",
        description: "A heartwarming story about a grumpy yet loveable man.",
        publishedYear: 2012,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "Atria Books",
        pageCount: 337,
        language: "English",
      },
      {
        title: "American Gods",
        author: "Neil Gaiman",
        isbn: "978-0-380-97365-4",
        genre: "Fantasy",
        description: "A novel about old gods versus new gods in America.",
        publishedYear: 2001,
        totalCopies: 4,
        availableCopies: 4,
        createdAt: new Date(),
        publisher: "William Morrow",
        pageCount: 635,
        language: "English",
      },
      {
        title: "Good Omens",
        author: "Terry Pratchett & Neil Gaiman",
        isbn: "978-0-06-085398-3",
        genre: "Fantasy",
        description: "A comedic novel about the coming of the Antichrist.",
        publishedYear: 1990,
        totalCopies: 3,
        availableCopies: 3,
        createdAt: new Date(),
        publisher: "Gollancz",
        pageCount: 383,
        language: "English",
      },
    ]

    await db.books.bulkAdd(sampleBooks)
  }
}

export const seedDatabase = initializeDatabase
