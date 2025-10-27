import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { getConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Routes (sẽ thêm sau)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend hoạt động!' });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stocks', stockRoutes);

app.get('/api/database', async (req, res) => {
  try {
    const connection = await getConnection();
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