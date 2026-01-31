import { Router } from 'express';

const router = Router();

// Add note to ticket
router.post('/:id/notes', (req, res) => {
  const { id } = req.params;
  const { author_name, content } = req.body;

  if (!author_name || !content) {
    return res.status(400).json({ error: 'Author name and content are required' });
  }

  try {
    // Check ticket exists
    const ticket = req.db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = req.db.prepare(`
      INSERT INTO notes (ticket_id, author_name, content)
      VALUES (?, ?, ?)
    `).run(id, author_name, content);

    // Update ticket's updated_at timestamp
    req.db.prepare('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    const note = req.db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notes for a ticket
router.get('/:id/notes', (req, res) => {
  const { id } = req.params;

  try {
    const notes = req.db.prepare(`
      SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC
    `).all(id);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
