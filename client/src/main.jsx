import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
const API = 'http://localhost:5000/api/applications';
const emptyForm = { company: '', role: '', status: 'Applied', applied_date: new Date().toISOString().slice(0,10), notes: '' };
function App() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('Loading applications...');
  const [busy, setBusy] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (filter !== 'All') params.set('status', filter);
      const response = await fetch(`${API}?${params}`);
      if (!response.ok) throw new Error('Could not load applications');
      setApplications(await response.json()); setMessage('');
    } catch (error) { setMessage('Cannot reach API. Start the backend and check MySQL connection.'); }
  }, [search, filter]);
  useEffect(() => { loadApplications(); }, [loadApplications]);

  function updateField(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');
      setForm(emptyForm); setEditingId(null); await loadApplications();
    } catch (error) { alert(error.message); }
    finally { setBusy(false); }
  }
  function edit(item) {
    setEditingId(item.id);
    setForm({ company: item.company, role: item.role, status: item.status, applied_date: String(item.applied_date).slice(0,10), notes: item.notes || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function remove(id) {
    if (!window.confirm('Delete this application?')) return;
    try { const r = await fetch(`${API}/${id}`, { method: 'DELETE' }); const d = await r.json(); if (!r.ok) throw new Error(d.message); await loadApplications(); }
    catch (error) { alert(error.message); }
  }
  const count = status => applications.filter(a => a.status === status).length;
  return <main className="wrap">
    <header><div><span className="eyebrow">CAREER ORGANIZER</span><h1>Job Application Tracker</h1><p>Keep every opportunity and interview in one place.</p></div><div className="mark">JT</div></header>
    <section className="stats"><div><small>Visible applications</small><b>{applications.length}</b></div><div><small>Applied</small><b>{count('Applied')}</b></div><div><small>Interviews</small><b>{count('Interview')}</b></div><div><small>Selected</small><b>{count('Selected')}</b></div></section>
    <section className="card"><h2>{editingId ? 'Update application' : 'Add new application'}</h2><form onSubmit={submit}>
      <div className="grid"><label>Company<input name="company" value={form.company} onChange={updateField} placeholder="Company name" required /></label><label>Job role<input name="role" value={form.role} onChange={updateField} placeholder="e.g. Software Developer" required /></label><label>Status<select name="status" value={form.status} onChange={updateField}>{['Applied','Interview','Selected','Rejected'].map(s=><option key={s}>{s}</option>)}</select></label><label>Applied date<input type="date" name="applied_date" value={form.applied_date} onChange={updateField} required /></label></div>
      <label>Notes<textarea name="notes" value={form.notes} onChange={updateField} placeholder="Interview date, referral, next steps..." rows="2" /></label>
      <div className="actions"><button disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Add application'}</button>{editingId && <button type="button" className="secondary" onClick={()=>{setEditingId(null);setForm(emptyForm)}}>Cancel</button>}</div>
    </form></section>
    <section className="card"><div className="tablehead"><h2>Applications</h2><div className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company or role"/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{['Applied','Interview','Selected','Rejected'].map(s=><option key={s}>{s}</option>)}</select></div></div>
      {message && <p className="notice">{message}</p>}
      <div className="tablewrap"><table><thead><tr><th>Company / Role</th><th>Status</th><th>Applied date</th><th>Notes</th><th>Actions</th></tr></thead><tbody>{applications.map(a=><tr key={a.id}><td><b>{a.company}</b><small>{a.role}</small></td><td><span className={`pill ${a.status.toLowerCase()}`}>{a.status}</span></td><td>{String(a.applied_date).slice(0,10)}</td><td className="notes">{a.notes || '—'}</td><td><div className="rowactions"><button className="edit" onClick={()=>edit(a)}>Edit</button><button className="delete" onClick={()=>remove(a.id)}>Delete</button></div></td></tr>)}</tbody></table></div>
      {!message && applications.length===0 && <p className="notice">No applications found. Add one above.</p>}
    </section><footer>React frontend · Express REST API · MySQL database</footer>
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);
