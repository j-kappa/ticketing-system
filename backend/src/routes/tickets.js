import { Router } from 'express';

const router = Router();

// List tickets with filtering
router.get('/', (req, res) => {
  const { status, priority, category, assignee_id, search, sort = 'created_at', order = 'desc' } = req.query;
  
  let sql = `
    SELECT t.*, tm.name as assignee_name, tm.email as assignee_email
    FROM tickets t
    LEFT JOIN team_members tm ON t.assignee_id = tm.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND t.status = ?';
    params.push(status);
  }
  if (priority) {
    sql += ' AND t.priority = ?';
    params.push(priority);
  }
  if (category) {
    sql += ' AND t.category = ?';
    params.push(category);
  }
  if (assignee_id) {
    sql += ' AND t.assignee_id = ?';
    params.push(assignee_id);
  }
  if (search) {
    sql += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.reporter_name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Validate sort column
  const validSorts = ['created_at', 'updated_at', 'priority', 'status', 'title'];
  const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
  const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  
  sql += ` ORDER BY t.${sortColumn} ${sortOrder}`;

  try {
    const tickets = req.db.prepare(sql).all(...params);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket with notes and attachments
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const ticket = req.db.prepare(`
      SELECT t.*, tm.name as assignee_name, tm.email as assignee_email
      FROM tickets t
      LEFT JOIN team_members tm ON t.assignee_id = tm.id
      WHERE t.id = ?
    `).get(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const notes = req.db.prepare(`
      SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC
    `).all(id);

    const attachments = req.db.prepare(`
      SELECT * FROM attachments WHERE ticket_id = ? ORDER BY created_at DESC
    `).all(id);

    res.json({ ...ticket, notes, attachments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ticket
router.post('/', (req, res) => {
  const { title, description, reporter_name, status, priority, category, assignee_id } = req.body;

  if (!title || !reporter_name) {
    return res.status(400).json({ error: 'Title and reporter name are required' });
  }

  try {
    const result = req.db.prepare(`
      INSERT INTO tickets (title, description, reporter_name, status, priority, category, assignee_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description || null,
      reporter_name,
      status || 'new',
      priority || 'medium',
      category || 'software',
      assignee_id || null
    );

    const ticket = req.db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, reporter_name, status, priority, category, assignee_id } = req.body;

  try {
    const existing = req.db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    req.db.prepare(`
      UPDATE tickets SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        reporter_name = COALESCE(?, reporter_name),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        category = COALESCE(?, category),
        assignee_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, reporter_name, status, priority, category, assignee_id, id);

    const ticket = req.db.prepare(`
      SELECT t.*, tm.name as assignee_name, tm.email as assignee_email
      FROM tickets t
      LEFT JOIN team_members tm ON t.assignee_id = tm.id
      WHERE t.id = ?
    `).get(id);
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ticket
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = req.db.prepare('DELETE FROM tickets WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
