import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Send, Calendar, MapPin, Users, Tag, Plus, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const categories = ['hackathon', 'workshop', 'seminar', 'webinar', 'competition', 'cultural', 'sports', 'volunteer', 'networking', 'other'];
const modes = ['online', 'offline', 'hybrid'];

const initialForm = {
  title: '', description: '', category: 'workshop', mode: 'offline',
  venue: '', meetLink: '', startDate: '', endDate: '', registrationDeadline: '',
  capacity: 100, tags: [], prizes: [], banner: '',
};

export default function CreateEventPage() {
  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState('');
  const [prizeInput, setPrizeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (t) => set('tags', form.tags.filter((x) => x !== t));
  const addPrize = () => {
    if (prizeInput.trim()) {
      set('prizes', [...form.prizes, prizeInput.trim()]);
      setPrizeInput('');
    }
  };
  const removePrize = (p) => set('prizes', form.prizes.filter((x) => x !== p));

  const handleSave = async (publish = false) => {
    if (!form.title || !form.description || !form.startDate || !form.endDate) {
      return toast.error('Fill in title, description, and dates');
    }
    setSaving(true);
    try {
      const { data } = await api.post('/events', form);
      if (publish) {
        await api.patch(`/events/${data.event._id}/publish`);
        toast.success('Event created and published!');
      } else {
        toast.success('Event saved as draft');
      }
      navigate('/organizer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>Create New Event</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Fill in the details to create your event</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary">
            <Save size={16} /> Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary">
            <Send size={16} /> Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Left - main form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic info */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Basic Information</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Event Title *</label>
                <input className="input-field" placeholder="e.g. HackFest 2025" value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea className="input-field" rows={5} placeholder="Describe your event in detail..." value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Category *</label>
                  <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {categories.map(c => <option key={c} value={c} style={{ background: '#141424', textTransform: 'capitalize' }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Mode *</label>
                  <select className="input-field" value={form.mode} onChange={(e) => set('mode', e.target.value)}>
                    {modes.map(m => <option key={m} value={m} style={{ background: '#141424', textTransform: 'capitalize' }}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Banner Image URL</label>
                <input className="input-field" placeholder="https://..." value={form.banner} onChange={(e) => set('banner', e.target.value)} />
                {form.banner && <img src={form.banner} alt="banner" style={{ marginTop: 8, width: '100%', height: 150, objectFit: 'cover', borderRadius: '0.5rem' }} onError={(e) => e.target.style.display = 'none'} />}
              </div>
            </div>
          </div>

          {/* Date & Venue */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Date & Location</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Start Date & Time *</label>
                  <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="form-label">End Date & Time *</label>
                  <input type="datetime-local" className="input-field" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label className="form-label">Registration Deadline</label>
                <input type="datetime-local" className="input-field" value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} style={{ colorScheme: 'dark' }} />
              </div>
              {(form.mode === 'offline' || form.mode === 'hybrid') && (
                <div>
                  <label className="form-label">Venue</label>
                  <input className="input-field" placeholder="Room / Hall / Address" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
                </div>
              )}
              {(form.mode === 'online' || form.mode === 'hybrid') && (
                <div>
                  <label className="form-label">Meeting Link</label>
                  <input className="input-field" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={(e) => set('meetLink', e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Tags & Prizes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Tags (for discovery)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" placeholder="e.g. AI, Python, Beginner" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} style={{ flex: 1 }} />
                  <button onClick={addTag} className="btn-secondary" style={{ flexShrink: 0 }}><Plus size={16} /></button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {form.tags.map((t) => <span key={t} className="badge badge-purple" style={{ cursor: 'pointer', gap: '0.4rem' }} onClick={() => removeTag(t)}>{t} <X size={11} /></span>)}
                </div>
              </div>

              <div>
                <label className="form-label">Prizes / Rewards</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" placeholder="e.g. ₹5000 cash prize" value={prizeInput} onChange={(e) => setPrizeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrize())} style={{ flex: 1 }} />
                  <button onClick={addPrize} className="btn-secondary" style={{ flexShrink: 0 }}><Plus size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {form.prizes.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', fontSize: '0.82rem', color: '#fbbf24' }}>
                      🏆 {p}
                      <button onClick={() => removePrize(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - capacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Event Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Maximum Capacity</label>
                <input type="number" className="input-field" min={1} value={form.capacity} onChange={(e) => set('capacity', parseInt(e.target.value) || 1)} />
              </div>

              <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <p style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.5rem' }}>📋 How it works</p>
                <ul style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 2, paddingLeft: '1rem' }}>
                  <li>Save as Draft to continue editing</li>
                  <li>Publish to make it visible</li>
                  <li>Students get a QR pass on registration</li>
                  <li>Certificates auto-generate on attendance</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary" style={{ justifyContent: 'center' }}>
                  <Save size={16} /> Save as Draft
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ justifyContent: 'center' }}>
                  <Send size={16} /> Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
