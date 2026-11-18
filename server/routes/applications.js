import { Router } from 'express';
import pool from '../db/pool.js';
const router = Router();
const allowedStatuses = ['Applied', 'Interview', 'Selected', 'Rejected'];

// GET /api/applications?status=Interview&search=Acme
router.get('/', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM applications WHERE 1=1';
    const params = [];
    if (status && allowedStatuses.includes(status)) { sql += ' AND status = ?'; params.push(status); }
    if (search) { sql += ' AND (company LIKE ? OR role LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    sql += ' ORDER BY applied_date DESC, id DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) { next(error); }
});

// POST /api/applications
router.post('/', async (req, res, next) => {
  try {
    const { company, role, status = 'Applied', applied_date, notes = '' } = req.body;
    if (!company?.trim() || !role?.trim() || !applied_date) return res.status(400).json({ message: 'Company, role and applied date are required.' });
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: 'Invalid application status.' });
    const [result] = await pool.execute(
      'INSERT INTO applications (company, role, status, applied_date, notes) VALUES (?, ?, ?, ?, ?)',
      [company.trim(), role.trim(), status, applied_date, notes]
    );
    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

// PUT /api/applications/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { company, role, status, applied_date, notes = '' } = req.body;
    if (!company?.trim() || !role?.trim() || !applied_date || !allowedStatuses.includes(status)) return res.status(400).json({ message: 'Provide valid company, role, status and applied date.' });
    const [result] = await pool.execute(
      'UPDATE applications SET company=?, role=?, status=?, applied_date=?, notes=? WHERE id=?',
      [company.trim(), role.trim(), status, applied_date, notes, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Application not found.' });
    const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM applications WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Application not found.' });
    res.json({ message: 'Application deleted successfully.' });
  } catch (error) { next(error); }
});
export default router;
