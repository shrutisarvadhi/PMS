const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body

// PostgreSQL Pool Setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Create Table (run once)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL
  );
`;

pool.query(createTableQuery)
  .then(() => console.log('Users table created or already exists'))
  .catch(err => console.error('Error creating table:', err));

// POST endpoint
app.post('/api/users', async (req, res) => {
  const { name, age } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *',
      [name, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET endpoint
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
