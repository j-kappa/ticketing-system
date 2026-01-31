import { Router } from 'express';

const router = Router();

// List all team members
router.get('/', (req, res) => {
  try {
    const members = req.db.prepare(`
      SELECT tm.*, 
        (SELECT COUNT(*) FROM tickets WHERE assignee_id = tm.id AND status != 'closed') as open_tickets
      FROM team_members tm
      ORDER BY tm.name ASC
    `).all();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single team member
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const member = req.db.prepare(`
      SELECT tm.*, 
        (SELECT COUNT(*) FROM tickets WHERE assignee_id = tm.id AND status != 'closed') as open_tickets
      FROM team_members tm
      WHERE tm.id = ?
    `).get(id);

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team member
router.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const result = req.db.prepare(`
      INSERT INTO team_members (name, email) VALUES (?, ?)
    `).run(name, email);

    const member = req.db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(member);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update team member
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const existing = req.db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    req.db.prepare(`
      UPDATE team_members SET
        name = COALESCE(?, name),
        email = COALESCE(?, email)
      WHERE id = ?
    `).run(name, email, id);

    const member = req.db.prepare('SELECT * FROM team_members WHERE id = ?').get(id);
    res.json(member);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete team member
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = req.db.prepare('DELETE FROM team_members WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
