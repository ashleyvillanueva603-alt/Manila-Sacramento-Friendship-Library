const API_BASE_URL = "https://gray-skunk-937601.hostingersite.com/api"

// Sample data arrays
const sampleBooks = [
  // Fiction
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    genre: "Fiction",
    description: "A gripping tale of racial injustice and childhood innocence in the American South.",
    publishedYear: 1960,
    publisher: "J.B. Lippincott & Co.",
    pageCount: 376,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    genre: "Fiction",
    description: "A dystopian social science fiction novel about totalitarian control.",
    publishedYear: 1949,
    publisher: "Secker & Warburg",
    pageCount: 328,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0-14-143951-8",
    genre: "Romance",
    description: "A romantic novel of manners set in Georgian England.",
    publishedYear: 1813,
    publisher: "T. Egerton",
    pageCount: 432,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    genre: "Fiction",
    description: "A critique of the American Dream set in the Jazz Age.",
    publishedYear: 1925,
    publisher: "Charles Scribner's Sons",
    pageCount: 180,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    isbn: "978-0-06-088328-7",
    genre: "Magical Realism",
    description: "A multi-generational story of the Buendía family.",
    publishedYear: 1967,
    publisher: "Harper & Row",
    pageCount: 417,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "978-0-316-76948-0",
    genre: "Fiction",
    description: "A controversial novel about teenage rebellion and alienation.",
    publishedYear: 1951,
    publisher: "Little, Brown and Company",
    pageCount: 277,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Lord of the Flies",
    author: "William Golding",
    isbn: "978-0-571-05686-2",
    genre: "Fiction",
    description: "A story about British boys stranded on an uninhabited island.",
    publishedYear: 1954,
    publisher: "Faber & Faber",
    pageCount: 224,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0-547-92822-7",
    genre: "Fantasy",
    description: "A fantasy adventure about Bilbo Baggins and his unexpected journey.",
    publishedYear: 1937,
    publisher: "George Allen & Unwin",
    pageCount: 310,
    language: "English",
    totalCopies: 7,
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "978-0-7475-3269-9",
    genre: "Fantasy",
    description: "The first book in the Harry Potter series.",
    publishedYear: 1997,
    publisher: "Bloomsbury",
    pageCount: 223,
    language: "English",
    totalCopies: 8,
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "978-0-544-00341-5",
    genre: "Fantasy",
    description: "An epic high fantasy novel about the quest to destroy the One Ring.",
    publishedYear: 1954,
    publisher: "George Allen & Unwin",
    pageCount: 1216,
    language: "English",
    totalCopies: 3,
  },

  // Science Fiction
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "978-0-441-17271-9",
    genre: "Science Fiction",
    description: "A science fiction epic set on the desert planet Arrakis.",
    publishedYear: 1965,
    publisher: "Chilton Books",
    pageCount: 688,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Foundation",
    author: "Isaac Asimov",
    isbn: "978-0-553-29335-0",
    genre: "Science Fiction",
    description: "The first novel in Asimov's Foundation series.",
    publishedYear: 1951,
    publisher: "Gnome Press",
    pageCount: 244,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    isbn: "978-0-06-085052-4",
    genre: "Science Fiction",
    description: "A dystopian novel about a technologically advanced future society.",
    publishedYear: 1932,
    publisher: "Chatto & Windus",
    pageCount: 311,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    isbn: "978-0-345-39180-3",
    genre: "Science Fiction",
    description: "A comedic science fiction series about space travel.",
    publishedYear: 1979,
    publisher: "Pan Books",
    pageCount: 224,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "Ender's Game",
    author: "Orson Scott Card",
    isbn: "978-0-812-55070-2",
    genre: "Science Fiction",
    description: "A military science fiction novel about child soldiers.",
    publishedYear: 1985,
    publisher: "Tor Books",
    pageCount: 324,
    language: "English",
    totalCopies: 4,
  },

  // Mystery/Thriller
  {
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    isbn: "978-0-307-45454-1",
    genre: "Mystery",
    description: "A psychological thriller about a journalist and a hacker.",
    publishedYear: 2005,
    publisher: "Norstedts Förlag",
    pageCount: 590,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    isbn: "978-0-307-58836-4",
    genre: "Thriller",
    description: "A psychological thriller about a marriage gone wrong.",
    publishedYear: 2012,
    publisher: "Crown Publishing Group",
    pageCount: 419,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    isbn: "978-0-385-50420-1",
    genre: "Thriller",
    description: "A mystery thriller involving art, history, and religion.",
    publishedYear: 2003,
    publisher: "Doubleday",
    pageCount: 454,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "And Then There Were None",
    author: "Agatha Christie",
    isbn: "978-0-06-207348-4",
    genre: "Mystery",
    description: "A classic mystery novel about ten strangers on an island.",
    publishedYear: 1939,
    publisher: "Collins Crime Club",
    pageCount: 272,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Silence of the Lambs",
    author: "Thomas Harris",
    isbn: "978-0-312-92458-5",
    genre: "Thriller",
    description: "A psychological horror thriller about FBI agent Clarice Starling.",
    publishedYear: 1988,
    publisher: "St. Martin's Press",
    pageCount: 352,
    language: "English",
    totalCopies: 4,
  },

  // Non-Fiction
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "978-0-06-231609-7",
    genre: "History",
    description: "A brief history of humankind from the Stone Age to the present.",
    publishedYear: 2011,
    publisher: "Harvill Secker",
    pageCount: 443,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "978-0-399-59050-4",
    genre: "Memoir",
    description: "A memoir about education and family in rural Idaho.",
    publishedYear: 2018,
    publisher: "Random House",
    pageCount: 334,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Immortal Life of Henrietta Lacks",
    author: "Rebecca Skloot",
    isbn: "978-1-4000-5217-2",
    genre: "Science",
    description: "The story of HeLa cells and their impact on medical research.",
    publishedYear: 2010,
    publisher: "Crown Publishing Group",
    pageCount: 381,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0-374-27563-1",
    genre: "Psychology",
    description: "A book about the two systems that drive the way we think.",
    publishedYear: 2011,
    publisher: "Farrar, Straus and Giroux",
    pageCount: 499,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    isbn: "978-1-4000-6928-6",
    genre: "Self-Help",
    description: "Why we do what we do in life and business.",
    publishedYear: 2012,
    publisher: "Random House",
    pageCount: 371,
    language: "English",
    totalCopies: 5,
  },

  // Classic Literature
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    isbn: "978-0-14-144114-6",
    genre: "Classic",
    description: "A coming-of-age novel following the experiences of its eponymous heroine.",
    publishedYear: 1847,
    publisher: "Smith, Elder & Co.",
    pageCount: 507,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    isbn: "978-0-14-143955-6",
    genre: "Classic",
    description: "A tale of passion and revenge on the Yorkshire moors.",
    publishedYear: 1847,
    publisher: "Thomas Cautley Newby",
    pageCount: 416,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "Great Expectations",
    author: "Charles Dickens",
    isbn: "978-0-14-143956-3",
    genre: "Classic",
    description: "The story of Pip, an orphan who rises from humble beginnings.",
    publishedYear: 1861,
    publisher: "Chapman & Hall",
    pageCount: 544,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    isbn: "978-0-14-243724-7",
    genre: "Classic",
    description: "The narrative of Captain Ahab's obsessive quest for the white whale.",
    publishedYear: 1851,
    publisher: "Richard Bentley",
    pageCount: 635,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    isbn: "978-0-14-243717-9",
    genre: "Classic",
    description: "The adventures of a boy and a runaway slave on the Mississippi River.",
    publishedYear: 1884,
    publisher: "Chatto & Windus",
    pageCount: 366,
    language: "English",
    totalCopies: 3,
  },

  // More Contemporary Fiction
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    isbn: "978-1-59448-000-3",
    genre: "Fiction",
    description: "A story of friendship and redemption set in Afghanistan.",
    publishedYear: 2003,
    publisher: "Riverhead Books",
    pageCount: 371,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Life of Pi",
    author: "Yann Martel",
    isbn: "978-0-15-100811-7",
    genre: "Fiction",
    description: "A philosophical novel about a boy stranded on a lifeboat with a tiger.",
    publishedYear: 2001,
    publisher: "Knopf Canada",
    pageCount: 319,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    isbn: "978-0-375-83100-3",
    genre: "Historical Fiction",
    description: "A story narrated by Death about a girl living in Nazi Germany.",
    publishedYear: 2005,
    publisher: "Picador",
    pageCount: 552,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    isbn: "978-0-7352-1909-0",
    genre: "Fiction",
    description: "A mystery and coming-of-age story set in the marshes of North Carolina.",
    publishedYear: 2018,
    publisher: "G.P. Putnam's Sons",
    pageCount: 370,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    isbn: "978-1-5011-3981-2",
    genre: "Fiction",
    description: "A reclusive Hollywood icon tells her life story to a young journalist.",
    publishedYear: 2017,
    publisher: "Atria Books",
    pageCount: 400,
    language: "English",
    totalCopies: 4,
  },

  // Additional genres and books to reach 100+
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "978-0-06-112241-5",
    genre: "Philosophy",
    description: "A philosophical novel about following one's dreams.",
    publishedYear: 1988,
    publisher: "HarperCollins",
    pageCount: 163,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    isbn: "978-1-5247-6313-8",
    genre: "Biography",
    description: "The memoir of former First Lady Michelle Obama.",
    publishedYear: 2018,
    publisher: "Crown Publishing Group",
    pageCount: 448,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    isbn: "978-0-06-245771-4",
    genre: "Self-Help",
    description: "A counterintuitive approach to living a good life.",
    publishedYear: 2016,
    publisher: "HarperOne",
    pageCount: 224,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-0-7352-1129-2",
    genre: "Self-Help",
    description: "An easy and proven way to build good habits and break bad ones.",
    publishedYear: 2018,
    publisher: "Avery",
    pageCount: 320,
    language: "English",
    totalCopies: 7,
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    isbn: "978-1-4516-3951-8",
    genre: "Self-Help",
    description: "Powerful lessons in personal change.",
    publishedYear: 1989,
    publisher: "Free Press",
    pageCount: 381,
    language: "English",
    totalCopies: 3,
  },

  // Science and Technology
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0-553-38016-3",
    genre: "Science",
    description: "A landmark volume in science writing about cosmology.",
    publishedYear: 1988,
    publisher: "Bantam Books",
    pageCount: 256,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    isbn: "978-0-19-929114-4",
    genre: "Science",
    description: "A book on evolution that popularized the gene-centered view.",
    publishedYear: 1976,
    publisher: "Oxford University Press",
    pageCount: 360,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "Freakonomics",
    author: "Steven D. Levitt",
    isbn: "978-0-06-073132-6",
    genre: "Economics",
    description: "A rogue economist explores the hidden side of everything.",
    publishedYear: 2005,
    publisher: "William Morrow",
    pageCount: 315,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Innovator's Dilemma",
    author: "Clayton M. Christensen",
    isbn: "978-0-87584-585-2",
    genre: "Business",
    description: "When new technologies cause great firms to fail.",
    publishedYear: 1997,
    publisher: "Harvard Business Review Press",
    pageCount: 286,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "978-1-4516-4853-4",
    genre: "Biography",
    description: "The exclusive biography of Apple's co-founder.",
    publishedYear: 2011,
    publisher: "Simon & Schuster",
    pageCount: 656,
    language: "English",
    totalCopies: 4,
  },

  // More Fiction and Literature
  {
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    isbn: "978-0-385-49081-8",
    genre: "Dystopian Fiction",
    description: "A dystopian novel set in a totalitarian society.",
    publishedYear: 1985,
    publisher: "McClelland & Stewart",
    pageCount: 311,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Beloved",
    author: "Toni Morrison",
    isbn: "978-1-4000-3341-6",
    genre: "Historical Fiction",
    description: "A story about the legacy of slavery in America.",
    publishedYear: 1987,
    publisher: "Alfred A. Knopf",
    pageCount: 324,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Color Purple",
    author: "Alice Walker",
    isbn: "978-0-15-119154-4",
    genre: "Fiction",
    description: "An epistolary novel about African American women in the South.",
    publishedYear: 1982,
    publisher: "Harcourt Brace Jovanovich",
    pageCount: 295,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "One Flew Over the Cuckoo's Nest",
    author: "Ken Kesey",
    isbn: "978-0-14-118123-4",
    genre: "Fiction",
    description: "A novel set in a mental institution in Oregon.",
    publishedYear: 1962,
    publisher: "Viking Press",
    pageCount: 325,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "The Sun Also Rises",
    author: "Ernest Hemingway",
    isbn: "978-0-684-80071-9",
    genre: "Fiction",
    description: "A novel about American and British expatriates in Europe.",
    publishedYear: 1926,
    publisher: "Charles Scribner's Sons",
    pageCount: 251,
    language: "English",
    totalCopies: 2,
  },

  // Additional Contemporary and Popular Books
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    isbn: "978-0-525-47881-2",
    genre: "Young Adult",
    description: "A love story between two teenagers with cancer.",
    publishedYear: 2012,
    publisher: "Dutton Books",
    pageCount: 313,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "The Hunger Games",
    author: "Suzanne Collins",
    isbn: "978-0-439-02348-1",
    genre: "Young Adult",
    description: "A dystopian novel about a televised fight to the death.",
    publishedYear: 2008,
    publisher: "Scholastic Press",
    pageCount: 374,
    language: "English",
    totalCopies: 8,
  },
  {
    title: "Twilight",
    author: "Stephenie Meyer",
    isbn: "978-0-316-01584-4",
    genre: "Young Adult",
    description: "A romance between a human girl and a vampire.",
    publishedYear: 2005,
    publisher: "Little, Brown and Company",
    pageCount: 498,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Maze Runner",
    author: "James Dashner",
    isbn: "978-0-385-73794-4",
    genre: "Young Adult",
    description: "A dystopian novel about teenagers trapped in a maze.",
    publishedYear: 2009,
    publisher: "Delacorte Press",
    pageCount: 375,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Divergent",
    author: "Veronica Roth",
    isbn: "978-0-06-202402-2",
    genre: "Young Adult",
    description: "A dystopian novel about a society divided into factions.",
    publishedYear: 2011,
    publisher: "Katherine Tegen Books",
    pageCount: 487,
    language: "English",
    totalCopies: 5,
  },

  // More Non-Fiction
  {
    title: "Quiet",
    author: "Susan Cain",
    isbn: "978-0-307-35214-9",
    genre: "Psychology",
    description: "The power of introverts in a world that can't stop talking.",
    publishedYear: 2012,
    publisher: "Crown Publishers",
    pageCount: 333,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Outliers",
    author: "Malcolm Gladwell",
    isbn: "978-0-316-01792-3",
    genre: "Psychology",
    description: "The story of success and what makes high-achievers different.",
    publishedYear: 2008,
    publisher: "Little, Brown and Company",
    pageCount: 309,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Tipping Point",
    author: "Malcolm Gladwell",
    isbn: "978-0-316-31696-2",
    genre: "Sociology",
    description: "How little things can make a big difference.",
    publishedYear: 2000,
    publisher: "Little, Brown and Company",
    pageCount: 301,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Blink",
    author: "Malcolm Gladwell",
    isbn: "978-0-316-01066-5",
    genre: "Psychology",
    description: "The power of thinking without thinking.",
    publishedYear: 2005,
    publisher: "Little, Brown and Company",
    pageCount: 296,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    isbn: "978-0-307-88789-4",
    genre: "Business",
    description: "How today's entrepreneurs use continuous innovation.",
    publishedYear: 2011,
    publisher: "Crown Business",
    pageCount: 336,
    language: "English",
    totalCopies: 3,
  },

  // Additional Classic and Modern Literature
  {
    title: "Catch-22",
    author: "Joseph Heller",
    isbn: "978-0-684-83339-9",
    genre: "Fiction",
    description: "A satirical novel about World War II.",
    publishedYear: 1961,
    publisher: "Simon & Schuster",
    pageCount: 453,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Slaughterhouse-Five",
    author: "Kurt Vonnegut",
    isbn: "978-0-385-31208-0",
    genre: "Fiction",
    description: "An anti-war novel about Billy Pilgrim's experiences.",
    publishedYear: 1969,
    publisher: "Delacorte Press",
    pageCount: 275,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Road",
    author: "Cormac McCarthy",
    isbn: "978-0-307-38789-9",
    genre: "Post-Apocalyptic",
    description: "A father and son's journey through a post-apocalyptic landscape.",
    publishedYear: 2006,
    publisher: "Alfred A. Knopf",
    pageCount: 287,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Never Let Me Go",
    author: "Kazuo Ishiguro",
    isbn: "978-1-4000-7877-6",
    genre: "Science Fiction",
    description: "A dystopian science fiction novel about human clones.",
    publishedYear: 2005,
    publisher: "Faber & Faber",
    pageCount: 288,
    language: "English",
    totalCopies: 2,
  },
  {
    title: "The Remains of the Day",
    author: "Kazuo Ishiguro",
    isbn: "978-0-679-73172-5",
    genre: "Fiction",
    description: "A novel about an English butler reflecting on his life.",
    publishedYear: 1989,
    publisher: "Faber & Faber",
    pageCount: 245,
    language: "English",
    totalCopies: 3,
  },

  // More Contemporary Fiction
  {
    title: "Big Little Lies",
    author: "Liane Moriarty",
    isbn: "978-0-399-16743-8",
    genre: "Fiction",
    description: "A novel about three women whose lives unravel to the point of murder.",
    publishedYear: 2014,
    publisher: "G.P. Putnam's Sons",
    pageCount: 460,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Girl on the Train",
    author: "Paula Hawkins",
    isbn: "978-1-59463-366-6",
    genre: "Thriller",
    description: "A psychological thriller about a woman who becomes entangled in a missing person's investigation.",
    publishedYear: 2015,
    publisher: "Riverhead Books",
    pageCount: 336,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Eleanor Oliphant Is Completely Fine",
    author: "Gail Honeyman",
    isbn: "978-0-7352-2894-8",
    genre: "Fiction",
    description: "A novel about a socially awkward woman learning to navigate relationships.",
    publishedYear: 2017,
    publisher: "HarperCollins",
    pageCount: 327,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "A Man Called Ove",
    author: "Fredrik Backman",
    isbn: "978-1-4767-3802-1",
    genre: "Fiction",
    description: "A heartwarming story about a grumpy yet loveable man.",
    publishedYear: 2012,
    publisher: "Atria Books",
    pageCount: 337,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "978-0-525-55948-1",
    genre: "Fiction",
    description: "A novel about a library between life and death.",
    publishedYear: 2020,
    publisher: "Viking",
    pageCount: 288,
    language: "English",
    totalCopies: 5,
  },

  // Additional Science Fiction and Fantasy
  {
    title: "The Martian",
    author: "Andy Weir",
    isbn: "978-0-553-41802-6",
    genre: "Science Fiction",
    description: "A story about an astronaut stranded on Mars.",
    publishedYear: 2011,
    publisher: "Crown Publishers",
    pageCount: 369,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "Ready Player One",
    author: "Ernest Cline",
    isbn: "978-0-307-88743-6",
    genre: "Science Fiction",
    description: "A dystopian science fiction novel set in a virtual reality world.",
    publishedYear: 2011,
    publisher: "Crown Publishers",
    pageCount: 374,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    isbn: "978-0-7564-0474-1",
    genre: "Fantasy",
    description: "The first book in The Kingkiller Chronicle series.",
    publishedYear: 2007,
    publisher: "DAW Books",
    pageCount: 662,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "American Gods",
    author: "Neil Gaiman",
    isbn: "978-0-380-97365-4",
    genre: "Fantasy",
    description: "A novel about old gods versus new gods in America.",
    publishedYear: 2001,
    publisher: "William Morrow",
    pageCount: 635,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Good Omens",
    author: "Terry Pratchett & Neil Gaiman",
    isbn: "978-0-06-085398-3",
    genre: "Fantasy",
    description: "A comedic novel about the coming of the Antichrist.",
    publishedYear: 1990,
    publisher: "Gollancz",
    pageCount: 383,
    language: "English",
    totalCopies: 3,
  },

  // Final additions to reach 100+
  {
    title: "The Giver",
    author: "Lois Lowry",
    isbn: "978-0-544-33626-0",
    genre: "Young Adult",
    description: "A dystopian novel about a society without pain or suffering.",
    publishedYear: 1993,
    publisher: "Houghton Mifflin",
    pageCount: 208,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Wonder",
    author: "R.J. Palacio",
    isbn: "978-0-375-86902-0",
    genre: "Young Adult",
    description: "A story about a boy with facial differences starting school.",
    publishedYear: 2012,
    publisher: "Alfred A. Knopf",
    pageCount: 315,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "The Perks of Being a Wallflower",
    author: "Stephen Chbosky",
    isbn: "978-0-671-02734-6",
    genre: "Young Adult",
    description: "A coming-of-age epistolary novel.",
    publishedYear: 1999,
    publisher: "Pocket Books",
    pageCount: 213,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Looking for Alaska",
    author: "John Green",
    isbn: "978-0-525-47506-4",
    genre: "Young Adult",
    description: "A coming-of-age novel about a teenager at boarding school.",
    publishedYear: 2005,
    publisher: "Dutton Books",
    pageCount: 221,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Thirteen Reasons Why",
    author: "Jay Asher",
    isbn: "978-1-59514-188-0",
    genre: "Young Adult",
    description: "A novel about a teenager who commits suicide.",
    publishedYear: 2007,
    publisher: "RazorBill",
    pageCount: 288,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "The Outsiders",
    author: "S.E. Hinton",
    isbn: "978-0-14-038572-4",
    genre: "Young Adult",
    description: "A coming-of-age novel about teenage gangs.",
    publishedYear: 1967,
    publisher: "Viking Press",
    pageCount: 192,
    language: "English",
    totalCopies: 5,
  },
  {
    title: "Holes",
    author: "Louis Sachar",
    isbn: "978-0-374-33265-7",
    genre: "Young Adult",
    description: "A novel about a boy sent to a detention center.",
    publishedYear: 1998,
    publisher: "Farrar, Straus and Giroux",
    pageCount: 233,
    language: "English",
    totalCopies: 4,
  },
  {
    title: "Bridge to Terabithia",
    author: "Katherine Paterson",
    isbn: "978-0-06-440184-3",
    genre: "Children's Literature",
    description: "A story about friendship and loss.",
    publishedYear: 1977,
    publisher: "Thomas Y. Crowell Co.",
    pageCount: 163,
    language: "English",
    totalCopies: 3,
  },
  {
    title: "Charlotte's Web",
    author: "E.B. White",
    isbn: "978-0-06-026385-3",
    genre: "Children's Literature",
    description: "A story about a pig named Wilbur and a spider named Charlotte.",
    publishedYear: 1952,
    publisher: "Harper & Brothers",
    pageCount: 184,
    language: "English",
    totalCopies: 6,
  },
  {
    title: "Where the Red Fern Grows",
    author: "Wilson Rawls",
    isbn: "978-0-553-27429-1",
    genre: "Children's Literature",
    description: "A story about a boy and his hunting dogs.",
    publishedYear: 1961,
    publisher: "Doubleday",
    pageCount: 245,
    language: "English",
    totalCopies: 3,
  },
]

const sampleUsers = [
  // Students
  {
    name: "Emma Johnson",
    email: "emma.johnson@email.com",
    role: "student",
    studentId: "STU001",
    phoneNumber: "555-0101",
  },
  { name: "Liam Smith", email: "liam.smith@email.com", role: "student", studentId: "STU002", phoneNumber: "555-0102" },
  {
    name: "Olivia Brown",
    email: "olivia.brown@email.com",
    role: "student",
    studentId: "STU003",
    phoneNumber: "555-0103",
  },
  { name: "Noah Davis", email: "noah.davis@email.com", role: "student", studentId: "STU004", phoneNumber: "555-0104" },
  { name: "Ava Wilson", email: "ava.wilson@email.com", role: "student", studentId: "STU005", phoneNumber: "555-0105" },
  {
    name: "William Miller",
    email: "william.miller@email.com",
    role: "student",
    studentId: "STU006",
    phoneNumber: "555-0106",
  },
  {
    name: "Sophia Moore",
    email: "sophia.moore@email.com",
    role: "student",
    studentId: "STU007",
    phoneNumber: "555-0107",
  },
  {
    name: "James Taylor",
    email: "james.taylor@email.com",
    role: "student",
    studentId: "STU008",
    phoneNumber: "555-0108",
  },
  {
    name: "Isabella Anderson",
    email: "isabella.anderson@email.com",
    role: "student",
    studentId: "STU009",
    phoneNumber: "555-0109",
  },
  {
    name: "Benjamin Thomas",
    email: "benjamin.thomas@email.com",
    role: "student",
    studentId: "STU010",
    phoneNumber: "555-0110",
  },
  {
    name: "Mia Jackson",
    email: "mia.jackson@email.com",
    role: "student",
    studentId: "STU011",
    phoneNumber: "555-0111",
  },
  {
    name: "Lucas White",
    email: "lucas.white@email.com",
    role: "student",
    studentId: "STU012",
    phoneNumber: "555-0112",
  },
  {
    name: "Charlotte Harris",
    email: "charlotte.harris@email.com",
    role: "student",
    studentId: "STU013",
    phoneNumber: "555-0113",
  },
  {
    name: "Henry Martin",
    email: "henry.martin@email.com",
    role: "student",
    studentId: "STU014",
    phoneNumber: "555-0114",
  },
  {
    name: "Amelia Thompson",
    email: "amelia.thompson@email.com",
    role: "student",
    studentId: "STU015",
    phoneNumber: "555-0115",
  },
  {
    name: "Alexander Garcia",
    email: "alexander.garcia@email.com",
    role: "student",
    studentId: "STU016",
    phoneNumber: "555-0116",
  },
  {
    name: "Harper Martinez",
    email: "harper.martinez@email.com",
    role: "student",
    studentId: "STU017",
    phoneNumber: "555-0117",
  },
  {
    name: "Sebastian Robinson",
    email: "sebastian.robinson@email.com",
    role: "student",
    studentId: "STU018",
    phoneNumber: "555-0118",
  },
  {
    name: "Evelyn Clark",
    email: "evelyn.clark@email.com",
    role: "student",
    studentId: "STU019",
    phoneNumber: "555-0119",
  },
  {
    name: "Michael Rodriguez",
    email: "michael.rodriguez@email.com",
    role: "student",
    studentId: "STU020",
    phoneNumber: "555-0120",
  },
  {
    name: "Abigail Lewis",
    email: "abigail.lewis@email.com",
    role: "student",
    studentId: "STU021",
    phoneNumber: "555-0121",
  },
  { name: "Ethan Lee", email: "ethan.lee@email.com", role: "student", studentId: "STU022", phoneNumber: "555-0122" },
  {
    name: "Emily Walker",
    email: "emily.walker@email.com",
    role: "student",
    studentId: "STU023",
    phoneNumber: "555-0123",
  },
  {
    name: "Daniel Hall",
    email: "daniel.hall@email.com",
    role: "student",
    studentId: "STU024",
    phoneNumber: "555-0124",
  },
  {
    name: "Elizabeth Allen",
    email: "elizabeth.allen@email.com",
    role: "student",
    studentId: "STU025",
    phoneNumber: "555-0125",
  },
  {
    name: "Matthew Young",
    email: "matthew.young@email.com",
    role: "student",
    studentId: "STU026",
    phoneNumber: "555-0126",
  },
  {
    name: "Sofia Hernandez",
    email: "sofia.hernandez@email.com",
    role: "student",
    studentId: "STU027",
    phoneNumber: "555-0127",
  },
  {
    name: "Joseph King",
    email: "joseph.king@email.com",
    role: "student",
    studentId: "STU028",
    phoneNumber: "555-0128",
  },
  {
    name: "Avery Wright",
    email: "avery.wright@email.com",
    role: "student",
    studentId: "STU029",
    phoneNumber: "555-0129",
  },
  {
    name: "Samuel Lopez",
    email: "samuel.lopez@email.com",
    role: "student",
    studentId: "STU030",
    phoneNumber: "555-0130",
  },
  { name: "Ella Hill", email: "ella.hill@email.com", role: "student", studentId: "STU031", phoneNumber: "555-0131" },
  {
    name: "David Scott",
    email: "david.scott@email.com",
    role: "student",
    studentId: "STU032",
    phoneNumber: "555-0132",
  },
  {
    name: "Scarlett Green",
    email: "scarlett.green@email.com",
    role: "student",
    studentId: "STU033",
    phoneNumber: "555-0133",
  },
  {
    name: "Carter Adams",
    email: "carter.adams@email.com",
    role: "student",
    studentId: "STU034",
    phoneNumber: "555-0134",
  },
  {
    name: "Grace Baker",
    email: "grace.baker@email.com",
    role: "student",
    studentId: "STU035",
    phoneNumber: "555-0135",
  },
  {
    name: "Owen Gonzalez",
    email: "owen.gonzalez@email.com",
    role: "student",
    studentId: "STU036",
    phoneNumber: "555-0136",
  },
  {
    name: "Chloe Nelson",
    email: "chloe.nelson@email.com",
    role: "student",
    studentId: "STU037",
    phoneNumber: "555-0137",
  },
  {
    name: "Wyatt Carter",
    email: "wyatt.carter@email.com",
    role: "student",
    studentId: "STU038",
    phoneNumber: "555-0138",
  },
  {
    name: "Zoey Mitchell",
    email: "zoey.mitchell@email.com",
    role: "student",
    studentId: "STU039",
    phoneNumber: "555-0139",
  },
  { name: "Luke Perez", email: "luke.perez@email.com", role: "student", studentId: "STU040", phoneNumber: "555-0140" },
  {
    name: "Lily Roberts",
    email: "lily.roberts@email.com",
    role: "student",
    studentId: "STU041",
    phoneNumber: "555-0141",
  },
  {
    name: "Jack Turner",
    email: "jack.turner@email.com",
    role: "student",
    studentId: "STU042",
    phoneNumber: "555-0142",
  },
  {
    name: "Hannah Phillips",
    email: "hannah.phillips@email.com",
    role: "student",
    studentId: "STU043",
    phoneNumber: "555-0143",
  },
  {
    name: "Ryan Campbell",
    email: "ryan.campbell@email.com",
    role: "student",
    studentId: "STU044",
    phoneNumber: "555-0144",
  },
  {
    name: "Layla Parker",
    email: "layla.parker@email.com",
    role: "student",
    studentId: "STU045",
    phoneNumber: "555-0145",
  },
  {
    name: "Nathan Evans",
    email: "nathan.evans@email.com",
    role: "student",
    studentId: "STU046",
    phoneNumber: "555-0146",
  },
  {
    name: "Zoe Edwards",
    email: "zoe.edwards@email.com",
    role: "student",
    studentId: "STU047",
    phoneNumber: "555-0147",
  },
  {
    name: "Caleb Collins",
    email: "caleb.collins@email.com",
    role: "student",
    studentId: "STU048",
    phoneNumber: "555-0148",
  },
  {
    name: "Nora Stewart",
    email: "nora.stewart@email.com",
    role: "student",
    studentId: "STU049",
    phoneNumber: "555-0149",
  },
  {
    name: "Isaac Sanchez",
    email: "isaac.sanchez@email.com",
    role: "student",
    studentId: "STU050",
    phoneNumber: "555-0150",
  },
  {
    name: "Leah Morris",
    email: "leah.morris@email.com",
    role: "student",
    studentId: "STU051",
    phoneNumber: "555-0151",
  },
  {
    name: "Gabriel Rogers",
    email: "gabriel.rogers@email.com",
    role: "student",
    studentId: "STU052",
    phoneNumber: "555-0152",
  },
  { name: "Hazel Reed", email: "hazel.reed@email.com", role: "student", studentId: "STU053", phoneNumber: "555-0153" },
  {
    name: "Christian Cook",
    email: "christian.cook@email.com",
    role: "student",
    studentId: "STU054",
    phoneNumber: "555-0154",
  },
  {
    name: "Violet Morgan",
    email: "violet.morgan@email.com",
    role: "student",
    studentId: "STU055",
    phoneNumber: "555-0155",
  },

  // Librarians
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@library.edu",
    role: "librarian",
    employeeId: "LIB001",
    phoneNumber: "555-1001",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@library.edu",
    role: "librarian",
    employeeId: "LIB002",
    phoneNumber: "555-1002",
  },
  {
    name: "Jennifer Williams",
    email: "jennifer.williams@library.edu",
    role: "librarian",
    employeeId: "LIB003",
    phoneNumber: "555-1003",
  },
]

interface ApiResponse {
  success: boolean
  message?: string
  data?: any
  id?: number
}

class ApiSeeder {
  private authToken: string | null = null
  private librarianId: number | null = null

  private async request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      console.log(`[API] ${options.method || "GET"} ${endpoint}`)
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        console.error(`[API Error] ${endpoint}:`, data)
        throw new Error(data.message || "API request failed")
      }

      console.log(`[API Success] ${endpoint}`)
      return data
    } catch (error) {
      console.error(`[API Request Error] ${endpoint}:`, error)
      throw error
    }
  }

  async loginAsLibrarian() {
    console.log("\n=== Logging in as librarian ===")
    try {
      const response = await this.request("/auth/login.php", {
        method: "POST",
        body: JSON.stringify({
          email: "sarah.johnson@library.edu",
          password: "password123",
        }),
      })

      if (response.data?.token) {
        this.authToken = response.data.token
        this.librarianId = response.data.user?.id
        console.log("✓ Logged in successfully as librarian")
        return true
      }
      return false
    } catch (error) {
      console.error("✗ Failed to login as librarian:", error)
      return false
    }
  }

  async createBooks() {
    console.log("\n=== Creating Books ===")
    const bookIds: number[] = []
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < sampleBooks.length; i++) {
      const book = sampleBooks[i]
      try {
        const response = await this.request("/books/create.php", {
          method: "POST",
          body: JSON.stringify({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            description: book.description,
            published_year: book.publishedYear,
            publisher: book.publisher,
            page_count: book.pageCount,
            language: book.language,
            total_copies: book.totalCopies,
            available_copies: book.totalCopies,
            cover_url: `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(book.title + " book cover")}`,
          }),
        })

        if (response.id) {
          bookIds.push(response.id)
          successCount++
          console.log(`✓ Created book ${i + 1}/${sampleBooks.length}: ${book.title}`)
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to create book: ${book.title}`, error)
      }
    }

    console.log(`\nBooks Summary: ${successCount} created, ${errorCount} failed`)
    return bookIds
  }

  async createUsers() {
    console.log("\n=== Creating Users ===")
    const userIds: number[] = []
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i]
      try {
        const response = await this.request("/auth/register.php", {
          method: "POST",
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: "password123",
            role: user.role,
            student_id: user.studentId,
            employee_id: user.employeeId,
            phone_number: user.phoneNumber,
          }),
        })

        if (response.id) {
          userIds.push(response.id)
          successCount++
          console.log(`✓ Created user ${i + 1}/${sampleUsers.length}: ${user.name}`)
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to create user: ${user.name}`, error)
      }
    }

    console.log(`\nUsers Summary: ${successCount} created, ${errorCount} failed`)
    return userIds
  }

  async createBorrowRecords(userIds: number[], bookIds: number[]) {
    console.log("\n=== Creating Borrow Records ===")
    const studentIds = userIds.slice(0, -3) // Exclude librarians
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < 200; i++) {
      const userId = studentIds[Math.floor(Math.random() * studentIds.length)]
      const bookId = bookIds[Math.floor(Math.random() * bookIds.length)]

      try {
        const response = await this.request("/borrow/create.php", {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            book_id: bookId,
          }),
        })

        if (response.success) {
          successCount++
          console.log(`✓ Created borrow record ${i + 1}/200`)
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to create borrow record ${i + 1}`, error)
      }
    }

    console.log(`\nBorrow Records Summary: ${successCount} created, ${errorCount} failed`)
  }

  async createBookRequests(userIds: number[], bookIds: number[]) {
    console.log("\n=== Creating Book Requests ===")
    const studentIds = userIds.slice(0, -3)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < 40; i++) {
      const userId = studentIds[Math.floor(Math.random() * studentIds.length)]
      const bookId = bookIds[Math.floor(Math.random() * bookIds.length)]

      try {
        const response = await this.request("/requests/create.php", {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            book_id: bookId,
            notes: "I would like to borrow this book",
          }),
        })

        if (response.success) {
          successCount++
          console.log(`✓ Created book request ${i + 1}/40`)
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Failed to create book request ${i + 1}`, error)
      }
    }

    console.log(`\nBook Requests Summary: ${successCount} created, ${errorCount} failed`)
  }
}

async function seedDatabase() {
  console.log("=".repeat(60))
  console.log("Starting Database Seeding via API")
  console.log(`API URL: ${API_BASE_URL}`)
  console.log("=".repeat(60))

  const seeder = new ApiSeeder()

  try {
    // Step 1: Login as librarian
    const loginSuccess = await seeder.loginAsLibrarian()
    if (!loginSuccess) {
      throw new Error("Failed to authenticate. Cannot proceed with seeding.")
    }

    // Step 2: Create books
    const bookIds = await seeder.createBooks()
    if (bookIds.length === 0) {
      throw new Error("No books were created. Cannot proceed with seeding.")
    }

    // Step 3: Create users
    const userIds = await seeder.createUsers()
    if (userIds.length === 0) {
      throw new Error("No users were created. Cannot proceed with seeding.")
    }

    // Step 4: Create borrow records
    await seeder.createBorrowRecords(userIds, bookIds)

    // Step 5: Create book requests
    await seeder.createBookRequests(userIds, bookIds)

    console.log("\n" + "=".repeat(60))
    console.log("Database Seeding Completed Successfully!")
    console.log("=".repeat(60))
    console.log("\nSummary:")
    console.log(`- ${bookIds.length} books created`)
    console.log(`- ${userIds.length} users created`)
    console.log(`- Borrow records created`)
    console.log(`- Book requests created`)
    console.log("\nDefault Credentials:")
    console.log("Librarian: sarah.johnson@library.edu / password123")
    console.log("Student: emma.johnson@email.com / password123")
  } catch (error) {
    console.error("\n" + "=".repeat(60))
    console.error("Database Seeding Failed!")
    console.error("=".repeat(60))
    console.error("Error:", error)
    throw error
  }
}

// Run the seeding function
seedDatabase()
