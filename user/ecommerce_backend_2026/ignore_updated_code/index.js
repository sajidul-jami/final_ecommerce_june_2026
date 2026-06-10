require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB =================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ================= AUTH MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// ================= AUTH =================

// SIGNUP
app.post("/signup", async (req, res) => {
  const { phone_number, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  pool.query(
    "INSERT INTO users (phone_number, password, role) VALUES (?,?, 'user')",
    [phone_number, hashed],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Signup success" });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { phone_number, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE phone_number=?",
    [phone_number],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token, user });
    }
  );
});

// ================= PRODUCTS =================

// GET ALL PRODUCTS (PUBLIC)
app.get("/products", (req, res) => {
  pool.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ADD PRODUCT (ADMIN)
app.post("/admin/products", verifyToken, isAdmin, (req, res) => {
  const { name, price, category_id, quantity } = req.body;

  pool.query(
    "INSERT INTO products (name, price, category_id, quantity, description, slug, photo, date_view, counter) VALUES (?,?,?,?, '', '', '', CURDATE(), 0)",
    [name, price, category_id, quantity],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product added" });
    }
  );
});

// UPDATE PRODUCT (ADMIN)
app.put("/admin/products/:id", verifyToken, isAdmin, (req, res) => {
  const { name, price, quantity } = req.body;

  pool.query(
    "UPDATE products SET name=?, price=?, quantity=? WHERE id=?",
    [name, price, quantity, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product updated" });
    }
  );
});

// DELETE PRODUCT (ADMIN)
app.delete("/admin/products/:id", verifyToken, isAdmin, (req, res) => {
  pool.query(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Product deleted" });
    }
  );
});

// ================= SALES =================

// CREATE SALE
app.post("/sales", verifyToken, (req, res) => {
  const { products, location } = req.body;

  pool.query(
    "INSERT INTO sales (user_id, products, location, sales_date) VALUES (?,?,?,NOW())",
    [req.user.id, JSON.stringify(products), location],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Sale created",
        saleId: result.insertId,
      });
    }
  );
});

// GET SALES (ADMIN)
app.get("/admin/sales", verifyToken, isAdmin, (req, res) => {
  pool.query("SELECT * FROM sales ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get('/singleproducts/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
        if (error) {
            res.status(500).send('Error fetching product from database');
        } else if (results.length === 0) {
            res.status(404).send('Product not found');
        } else {
            res.json(results[0]); // Send the single product as JSON
            //console.log(results[0]);
        }
    });
});

// Close MySQL connection pool when the application exits
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log('MySQL connection pool closed');
            process.exit(0);
        }
    });
});

// ================= START =================
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});