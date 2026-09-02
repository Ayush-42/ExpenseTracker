const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Connect to MongoDB
connectDB();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// Profile pictures travel as base64 data URLs, which exceed the 100kb default.
app.use(express.json({ limit: '6mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'expense-tracker-api' });
});

// API Routes
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/profile', require('./routes/profile'));

// Unknown API routes must still answer with JSON so the client can show a real message
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Image is too large. Please pick a smaller picture.' });
  }
  console.error('❌ Unhandled server error:', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/expenses`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already used by another app.\n` +
      `   Set a different PORT in server/.env and update VITE_API_URL in client/.env to match.`
    );
    process.exit(1);
  }
  throw error;
});
