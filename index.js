// Add this line at the very top!
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const axios = require("axios");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Database Configuration
const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Database connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // This line is crucial!
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Helper function to get book cover from Open Library API
async function getBookCover(isbn) {
  try {
    if (!isbn) return null;
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

    // Check if cover exists by making a HEAD request
    const response = await axios.head(coverUrl);
    return response.status === 200 ? coverUrl : null;
  } catch (error) {
    console.log("Cover not found for ISBN:", isbn);
    return null;
  }
}

// Routes

// Home page - display all books
app.get("/", async (req, res) => {
  try {
    const sortBy = req.query.sort || "date_read";
    const order = req.query.order || "DESC";

    let query = "SELECT * FROM books ORDER BY ";

    switch (sortBy) {
      case "rating":
        query += "rating";
        break;
      case "title":
        query += "title";
        break;
      case "author":
        query += "author";
        break;
      default:
        query += "date_read";
    }

    query += ` ${order}`;

    const result = await db.query(query);
    res.render("index", {
      books: result.rows,
      currentSort: sortBy,
      currentOrder: order,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Error loading books");
  }
});

// Add book page
app.get("/add", (req, res) => {
  res.render("add-book");
});

// Create new book
app.post("/add", async (req, res) => {
  try {
    const { title, author, isbn, rating, notes, date_read } = req.body;

    // Get book cover from API
    const coverUrl = await getBookCover(isbn);

    const query = `
            INSERT INTO books (title, author, isbn, rating, notes, date_read, cover_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

    await db.query(query, [
      title,
      author,
      isbn || null,
      rating || null,
      notes,
      date_read || null,
      coverUrl,
    ]);
    res.redirect("/");
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).send("Error adding book");
  }
});

// Edit book page
app.get("/edit/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const result = await db.query("SELECT * FROM books WHERE id = $1", [
      bookId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Book not found");
    }

    res.render("edit-book", { book: result.rows[0] });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("Error loading book");
  }
});

// Update book
app.post("/edit/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, isbn, rating, notes, date_read } = req.body;

    // Get updated book cover if ISBN changed
    const coverUrl = await getBookCover(isbn);

    const query = `
            UPDATE books 
            SET title = $1, author = $2, isbn = $3, rating = $4, notes = $5, 
                date_read = $6, cover_url = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
        `;

    await db.query(query, [
      title,
      author,
      isbn || null,
      rating || null,
      notes,
      date_read || null,
      coverUrl,
      bookId,
    ]);
    res.redirect("/");
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).send("Error updating book");
  }
});

// Delete book
app.post("/delete/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).send("Error deleting book");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
