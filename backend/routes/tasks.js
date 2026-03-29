const express = require("express");
const db = require("../config/dbConnection");

const verifyToken = require("../middleware/authToken");
const isAdmin = require("../middleware/admin");

const router = express.Router();


// ADMIN: Assign task to user
router.post("/assign", verifyToken, isAdmin, (req, res) => {
  const { title, description, assigned_to, deadline } = req.body;
  const created_by = req.user.id;

  if (!title || !assigned_to || !deadline) {
    return res.status(400).json({
      message: "Title, assigned_to and deadline are required"
    });
  }

  if (isNaN(assigned_to)) {
    return res.status(400).json({
      message: "assigned_to must be a valid user ID"
    });
  }

  if (new Date(deadline) < new Date()) {
    return res.status(400).json({
      message: "Deadline cannot be in the past"
    });
  }

  const sql = `
    INSERT INTO tasks (title, description, assigned_to, deadline, created_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, assigned_to, deadline, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Task assigned successfully",
        taskId: result.insertId
      });
    }
  );
});


//  USER: Create own task
router.post("/", verifyToken, (req, res) => {
  const { title, description, deadline } = req.body;
  const userId = req.user.id;

  if (!title || !deadline) {
    return res.status(400).json({
      message: "Title and deadline are required"
    });
  }

  if (new Date(deadline) < new Date()) {
    return res.status(400).json({
      message: "Deadline cannot be in the past"
    });
  }

  const sql = `
    INSERT INTO tasks (title, description, assigned_to, created_by, deadline)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, userId, userId, deadline],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Task created successfully",
        taskId: result.insertId
      });
    }
  );
});


//  USER: Get all tasks
router.get("/userTasks", verifyToken, (req, res) => {
  const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT id, title, description, status, deadline, created_at
    FROM tasks
    WHERE assigned_to = ?
      AND created_by != ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM tasks
    WHERE assigned_to = ?
      AND created_by != ?
  `;

  db.query(countSql, [userId, userId], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countResult[0].total;

    db.query(sql, [userId, userId, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        tasks: results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    });
  });
});

router.get("/taskStats", verifyToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      status,
      COUNT(*) AS count
    FROM tasks
    WHERE assigned_to = ?
    GROUP BY status
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const stats = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    results.forEach((row) => {
      stats[row.status] = row.count;
    });

    res.json({ stats });
  });
});


// USER: Update task status
router.patch("/:id/status", verifyToken, (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;
  const { status } = req.body;

  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const allowedStatus = ["pending", "in_progress", "completed"];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const sql = `
    UPDATE tasks
    SET status = ?
    WHERE id = ? AND assigned_to = ?
  `;

  db.query(sql, [status, taskId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "Task not found or not authorized"
      });
    }

    res.json({ message: "Task status updated successfully" });
  });
});


//  DELETE TASK
router.delete("/:id", verifyToken, (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const getTaskSql = "SELECT * FROM tasks WHERE id = ?";

  db.query(getTaskSql, [taskId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = results[0];

    if (task.created_by !== task.assigned_to) {
      if (userRole !== "admin") {
        return res.status(403).json({
          message: "Only admin can delete this task"
        });
      }
    } else {
      if (task.created_by !== userId) {
        return res.status(403).json({
          message: "You can only delete your own tasks"
        });
      }
    }

    const deleteSql = "DELETE FROM tasks WHERE id = ?";

    db.query(deleteSql, [taskId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Task deleted successfully" });
    });
  });
});


router.get("/myTasks", verifyToken, (req, res) => {
  const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT id, title, description, status, deadline, created_at
    FROM tasks
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total FROM tasks WHERE created_by = ?
  `;

  db.query(countSql, [userId], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countResult[0].total;

    db.query(sql, [userId, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        tasks: results,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    });
  });
});

// ADMIN: Get assigned tasks
router.get("/assigned", verifyToken, isAdmin, (req, res) => {
  const adminId = req.user.id;
  const userId = req.query.userId; 

  let sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.status,
      t.deadline,
      t.created_at,
      u.name AS assigned_user_name,
      u.email AS assigned_user_email
    FROM tasks t
    JOIN users u ON t.assigned_to = u.id
    WHERE t.created_by = ?
      AND t.created_by != t.assigned_to
  `;

  let params = [adminId];

  
  if (userId) {
    sql += " AND t.assigned_to = ?";
    params.push(userId);
  }

  sql += " ORDER BY t.created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ tasks: results });
  });
});


//  ADMIN: Delete assigned task only
router.delete("/admin/:id", verifyToken, isAdmin, (req, res) => {
  const taskId = req.params.id;
  const adminId = req.user.id;

  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  const sql = `
    SELECT * FROM tasks
    WHERE id = ?
      AND created_by = ?
      AND created_by != assigned_to
  `;

  db.query(sql, [taskId, adminId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({
        message: "Task not found or not authorized"
      });
    }

    const deleteSql = "DELETE FROM tasks WHERE id = ?";

    db.query(deleteSql, [taskId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Admin assigned task deleted successfully"
      });
    });
  });
});


module.exports = router;