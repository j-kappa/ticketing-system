import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv', 'text/log',
      'application/json',
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload attachment to ticket
router.post('/:id/attachments', upload.single('file'), (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Check ticket exists
    const ticket = req.db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);
    if (!ticket) {
      // Delete uploaded file if ticket doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = req.db.prepare(`
      INSERT INTO attachments (ticket_id, filename, original_name, mimetype, size)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size);

    // Update ticket's updated_at timestamp
    req.db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    const attachment = req.db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attachments for a ticket
router.get('/:id/attachments', (req, res) => {
  const { id } = req.params;

  try {
    const attachments = req.db.prepare(`
      SELECT * FROM attachments WHERE ticket_id = ? ORDER BY created_at DESC
    `).all(id);
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download/serve attachment
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const attachment = req.db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_name}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attachment
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const attachment = req.db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    req.db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
