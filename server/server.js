const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware – allow frontend origin from env (e.g. Vercel URL); no code change needed when URL changes
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sites', require('./routes/sites'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

