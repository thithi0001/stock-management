const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (sẽ thêm sau)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend hoạt động!' });
});

app.get('/api/database', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM roles');
    connection.release();
    res.json({ message: 'Database hoạt động!', data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});