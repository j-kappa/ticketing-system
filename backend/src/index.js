import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';
import ticketsRouter from './routes/tickets.js';
import notesRouter from './routes/notes.js';
import attachmentsRouter from './routes/attachments.js';
import teamRouter from './routes/team.js';
import statsRouter from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/tickets', notesRouter);
app.use('/api/tickets', attachmentsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/team', teamRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
