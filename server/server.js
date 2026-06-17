import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import submissionRoutes from './routes/submissions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autograde';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    console.log('Ensure MongoDB service is running locally or MONGODB_URI is specified in .env');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AutoGrade API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
