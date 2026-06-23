import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import api from '../../api/axios';
import EventCard from '../../components/EventCard';
import { Link } from 'react-router-dom';

const categories = ['all', 'hackathon', 'workshop', 'seminar', 'webinar', 'competition', 'cultural', 'sports', 'volunteer', 'networking'];
const modes = ['all', 'online', 'offline', 'hybrid'];
const sorts = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'startDate', label: 'Upcoming First' },
  { value: '-registeredCount', label: 'Most Popular' },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [mode, setMode] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort, status: 'published' });
      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);
      if (mode !== 'all') params.set('mode', mode);
      const { data } = await api.get(`/events?${params}`);
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, category, mode, sort]);
  useEffect(() => { fetchEvents(); }, [page, search, category, mode, sort]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 16 }}>E</div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: '#e2e8f0', fontSize: '1.1rem' }}>EventVerse</span>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}>Join Free</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 5%' }}>
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>
            Discover Events
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{total} events available</p>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              className="input-field"
              placeholder="Search events, categories, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem', paddingRight: search ? '2.5rem' : '1rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  border: category === cat ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  background: category === cat ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                  color: category === cat ? '#c4b5fd' : '#94a3b8',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >{cat}</button>
            ))}
          </div>

          {/* Mode + Sort row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select value={mode} onChange={(e) => setMode(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}>
              {modes.map(m => <option key={m} value={m} style={{ background: '#141424' }}>{m === 'all' ? 'All Modes' : m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}>
              {sorts.map(s => <option key={s.value} value={s.value} style={{ background: '#141424' }}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>No events found</p>
            <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{
                  width: 36, height: 36, borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem',
                  border: page === p ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  background: page === p ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                  color: page === p ? '#c4b5fd' : '#94a3b8',
                }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
