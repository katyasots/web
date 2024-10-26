const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Load initial data
let books = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'books.json'), 'utf8'));

// Function to save books to JSON file
function saveBooks() {
    fs.writeFileSync(path.join(__dirname, 'data', 'books.json'), JSON.stringify(books, null, 2), 'utf8');
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { books });
});

app.get('/books', (req, res) => {
    const available = req.query.available === 'true';
    const overdue = req.query.overdue === 'true';

    let filteredBooks = books;

    if (available) {
        filteredBooks = filteredBooks.filter(book => book.available);
    }

    if (overdue) {
        filteredBooks = filteredBooks.filter(book => book.returnDate && new Date(book.returnDate) < new Date());
    }

    res.json(filteredBooks);
});

app.get('/book/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    res.render('book', { book });
});

app.post('/book', (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        available: true,
        borrower: null,
        returnDate: null
    };

    books.push(newBook);
    saveBooks();
    res.redirect('/');
});

app.post('/book/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book) {
        book.title = req.body.title;
        book.author = req.body.author;
        book.year = req.body.year;
        saveBooks();
        res.redirect(`/book/${book.id}`);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.post('/book/:id/checkout', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book) {
        book.available = false;
        book.borrower = req.body.borrower;
        book.returnDate = req.body.returnDate;
        saveBooks();
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.post('/book/:id/return', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book) {
        book.available = true;
        book.borrower = null;
        book.returnDate = null;
        saveBooks();
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.delete('/book/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        saveBooks();
        res.json({ message: 'Book deleted' });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});