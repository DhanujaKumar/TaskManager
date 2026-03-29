const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/dbConnection");

const verifyToken = require("../middleware/authToken");
const isAdmin = require("../middleware/admin");

const router = express.Router();


//  LOGIN API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {

    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  });
});


//  REGISTER (ADMIN ONLY)
router.post("/register", verifyToken, isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, role || "user"], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: "User created successfully" });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//  ADMIN: GET USERS EXCEPT LOGGED-IN USER
router.get("/allusers", verifyToken, isAdmin, (req, res) => {

  const loggedInUserId = req.user.id;

  const sql = `
    SELECT id, name, email, role
    FROM users 
    WHERE id != ?
  `;

  db.query(sql, [loggedInUserId], (err, results) => {

    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      users: results
    });
  });
});

module.exports = router;
