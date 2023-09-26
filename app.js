const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('tasks.db');

// Create a table to store tasks
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// API to create a task
app.post('/tasks', (req, res) => {
  const { title, status } = req.body;
  db.run('INSERT INTO tasks (title, status) VALUES (?, ?)', [title, status], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to create task' });
      return;
    }
    res.status(201).json({ message: 'Task created successfully', taskId: this.lastID });
  });
});

// API to update a task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, status } = req.body;
  db.run('UPDATE tasks SET title = ?, status = ? WHERE id = ?', [title, status, id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to update task' });
      return;
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// API to get all tasks (paginated)
app.get('/tasks', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  db.all('SELECT * FROM tasks LIMIT ? OFFSET ?', [pageSize, offset], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch tasks' });
      return;
    }
    res.json(rows);
  });
});

// API to get task metrics
app.get('/task-metrics', (req, res) => {
  db.get('SELECT COUNT(*) AS open_tasks FROM tasks WHERE status = "open"', (err, openTasks) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Failed to fetch task metrics' });
      return;
    }
    db.get('SELECT COUNT(*) AS inprogress_tasks FROM tasks WHERE status = "inprogress"', (err, inProgressTasks) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch task metrics' });
        return;
      }
      db.get('SELECT COUNT(*) AS completed_tasks FROM tasks WHERE status = "completed"', (err, completedTasks) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Failed to fetch task metrics' });
          return;
        }
        res.json({
          open_tasks: openTasks.open_tasks || 0,
          inprogress_tasks: inProgressTasks.inprogress_tasks || 0,
          completed_tasks: completedTasks.completed_tasks || 0,
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// DELETE a task by ID
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  // Check if taskId is a valid integer
  if (!Number.isInteger(parseInt(taskId))) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const sql = 'DELETE FROM tasks WHERE id = ?';
  const params = [taskId];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // No rows were affected, which means the task with the given ID was not found.
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
});
