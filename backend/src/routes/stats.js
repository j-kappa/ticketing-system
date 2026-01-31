import { Router } from 'express';

const router = Router();

// Get dashboard statistics
router.get('/', (req, res) => {
  try {
    // Total and by status
    const statusCounts = req.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets
    `).get();

    // By priority (open tickets only)
    const priorityCounts = req.db.prepare(`
      SELECT 
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
      FROM tickets
      WHERE status NOT IN ('closed')
    `).get();

    // By category (open tickets only)
    const categoryCounts = req.db.prepare(`
      SELECT 
        SUM(CASE WHEN category = 'hardware' THEN 1 ELSE 0 END) as hardware,
        SUM(CASE WHEN category = 'software' THEN 1 ELSE 0 END) as software,
        SUM(CASE WHEN category = 'network' THEN 1 ELSE 0 END) as network,
        SUM(CASE WHEN category = 'access' THEN 1 ELSE 0 END) as access
      FROM tickets
      WHERE status NOT IN ('closed')
    `).get();

    // Team workload
    const teamWorkload = req.db.prepare(`
      SELECT 
        tm.id,
        tm.name,
        COUNT(t.id) as assigned_tickets
      FROM team_members tm
      LEFT JOIN tickets t ON tm.id = t.assignee_id AND t.status NOT IN ('closed')
      GROUP BY tm.id
      ORDER BY assigned_tickets DESC
    `).all();

    // Recent tickets
    const recentTickets = req.db.prepare(`
      SELECT t.*, tm.name as assignee_name
      FROM tickets t
      LEFT JOIN team_members tm ON t.assignee_id = tm.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `).all();

    // Unassigned open tickets
    const unassignedCount = req.db.prepare(`
      SELECT COUNT(*) as count
      FROM tickets
      WHERE assignee_id IS NULL AND status NOT IN ('closed')
    `).get();

    res.json({
      status: statusCounts,
      priority: priorityCounts,
      category: categoryCounts,
      teamWorkload,
      recentTickets,
      unassignedCount: unassignedCount.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
