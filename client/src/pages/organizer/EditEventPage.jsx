import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EditEventPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => {
      const e = data.event;
      setForm({
        title: e.title, description: e.description, category: e.category,
        mode: e.mode, venue: e.venue, meetLink: e.meetLink,
        startDate: e.startDate?.slice(0, 16), endDate: e.endDate?.slice(0, 16),
        registrationDeadline: e.registrationDeadline?.slice(0, 16) || '',
        capacity: e.capacity, tags: e.tags || [], prizes: e.prizes || [], banner: e.banner || '',
      });
    }).catch(() => toast.error('Event not found'));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/events/${id}`, form);
      toast.success('Event updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (!form) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>Edit Event</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {[
          { label: 'Title', key: 'title', type: 'text', placeholder: 'Event title' },
          { label: 'Banner URL', key: 'banner', type: 'text', placeholder: 'https://...' },
          { label: 'Capacity', key: 'capacity', type: 'number', placeholder: '100' },
          { label: 'Venue', key: 'venue', type: 'text', placeholder: 'Room / Hall' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="form-label">{label}</label>
            <input type={type} className="input-field" placeholder={placeholder} value={form[key]} onChange={(e) => set(key, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)} />
          </div>
        ))}
        <div>
          <label className="form-label">Description</label>
          <textarea className="input-field" rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Start Date</label>
            <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input type="datetime-local" className="input-field" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
