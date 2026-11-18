import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applicationsRouter from './routes/applications.js';
import pool from './db/pool.js';

dotenv.config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json()); // Parses incoming JSON request bodies
app.get('/api/health', async (req, res, next) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch (error) { next(error); }
});
app.use('/api/applications', applicationsRouter);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error. Check the server console.' });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
