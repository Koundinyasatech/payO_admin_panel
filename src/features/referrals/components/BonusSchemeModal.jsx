// src/features/referrals/components/BonusSchemeModal.jsx
import { useState, useEffect } from 'react';

export function BonusSchemeModal({ scheme, onSave, onClose }) {
  const [formData, setFormData] = useState({
    scheme_name: '',
    scheme_code: '',
    description: '',
    schema_type: 'Referral',
    bonus_type: 'Fixed',
    bonus_amount: '',
    bonus_percentage: '',
    trigger_event: '',
    max_redemptions_per_user: '',
    max_total_redemptions: '',
    valid_from: '',
    valid_to: '',
    is_active: true,
  });

  // Populate form when editing
  useEffect(() => {
    if (scheme) {
      setFormData({
        scheme_name: scheme.scheme_name || '',
        scheme_code: scheme.scheme_code || '',
        description: scheme.description || '',
        schema_type: scheme.schema_type || 'Referral',
        bonus_type: scheme.bonus_type || 'Fixed',
        bonus_amount: scheme.bonus_amount || '',
        bonus_percentage: scheme.bonus_percentage || '',
        trigger_event: scheme.trigger_event || '',
        max_redemptions_per_user: scheme.max_redemptions_per_user || '',
        max_total_redemptions: scheme.max_total_redemptions || '',
        valid_from: scheme.valid_from || '',
        valid_to: scheme.valid_to || '',
        is_active: scheme.is_active !== undefined ? scheme.is_active : true,
      });
    }
  }, [scheme]);

  // 🔒 Lock body scroll when modal opens – prevents background movement
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    // 🎯 Overlay: fixed to viewport, flex‑centered, covers everything
    <div
      className="overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* 📦 Modal container – stays put, scrolls internally if needed */}
      <div
        className="modal"
        style={{
          position: 'relative',
          maxWidth: 560,
          width: '100%',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        <div className="modal-head" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{scheme ? 'Edit Bonus Scheme' : 'Add Bonus Scheme'}</h3>
            <button
              type="button"
              className="btn btn-ghost icon-btn"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Modal body – scrolls internally without moving the modal */}
          <div
            className="modal-body"
            style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Scheme Name *</label>
                <input
                  type="text"
                  name="scheme_name"
                  value={formData.scheme_name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
              <div className="form-group">
                <label>Scheme Code *</label>
                <input
                  type="text"
                  name="scheme_code"
                  value={formData.scheme_code}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Schema Type</label>
                <select
                  name="schema_type"
                  value={formData.schema_type}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                >
                  <option value="Referral">Referral</option>
                  <option value="Signup">Signup</option>
                  <option value="Transaction">Transaction</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bonus Type</label>
                <select
                  name="bonus_type"
                  value={formData.bonus_type}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
            </div>

            {formData.bonus_type === 'Fixed' ? (
              <div className="form-group">
                <label>Bonus Amount (₹)</label>
                <input
                  type="number"
                  name="bonus_amount"
                  value={formData.bonus_amount}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Bonus Percentage (%)</label>
                <input
                  type="number"
                  name="bonus_percentage"
                  value={formData.bonus_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.5"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
            )}

            <div className="form-group">
              <label>Trigger Event</label>
              <input
                type="text"
                name="trigger_event"
                value={formData.trigger_event}
                onChange={handleChange}
                placeholder="e.g., Referral Count, Signup, etc."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Max Redemptions per User</label>
                <input
                  type="number"
                  name="max_redemptions_per_user"
                  value={formData.max_redemptions_per_user}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
              <div className="form-group">
                <label>Max Total Redemptions</label>
                <input
                  type="number"
                  name="max_total_redemptions"
                  value={formData.max_total_redemptions}
                  onChange={handleChange}
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Valid From</label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
              <div className="form-group">
                <label>Valid To</label>
                <input
                  type="date"
                  name="valid_to"
                  value={formData.valid_to}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: 18, height: 18 }}
              />
              <label style={{ margin: 0 }}>Active</label>
            </div>
          </div>

          {/* Footer – always at bottom */}
          <div
            className="modal-foot"
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {scheme ? 'Update Scheme' : 'Create Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}