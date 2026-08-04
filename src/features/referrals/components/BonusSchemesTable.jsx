// src/features/referrals/components/BonusSchemesTable.jsx
import { Skeleton } from '../../../components/Skeleton';
import { Badge } from '../../../components/Badge';

export function BonusSchemesTable({ data, loading, onEdit, onDelete, onToggleStatus }) {
  if (loading) {
    return (
      <tbody>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              <td><Skeleton w={140} h={16} radius={4} /></td>
              <td><Skeleton w={90} h={16} radius={4} /></td>
              <td><Skeleton w={80} h={22} radius={12} /></td>
              <td><Skeleton w={80} h={18} radius={4} /></td>
              <td><Skeleton w={120} h={16} radius={4} /></td>
              <td><Skeleton w={70} h={22} radius={20} /></td>
              <td><Skeleton w={100} h={28} radius={6} /></td>
            </tr>
          ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {data.map((scheme, idx) => (
        <tr
          key={scheme.scheme_code || scheme.scheme_id}
          style={{
            borderBottom: '1px solid #F3F4F6',
            transition: 'background 0.15s',
            background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F3FF')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB')
          }
        >
          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827' }}>
            {scheme.scheme_name}
          </td>
          <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#6B7280' }}>
            {scheme.scheme_code}
          </td>
          <td style={{ padding: '14px 16px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                background: '#E0E7FF',
                color: '#4338CA',
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              {scheme.schema_type || scheme.scheme_type || '—'}
            </span>
          </td>
          <td style={{ padding: '14px 16px' }}>
            {scheme.bonus_type === 'Fixed' ? (
              <span style={{ fontWeight: 700, color: '#059669' }}>₹{scheme.bonus_amount || scheme.bonus_value}</span>
            ) : (
              <span style={{ fontWeight: 700, color: '#D97706' }}>{scheme.bonus_percentage || scheme.bonus_value}%</span>
            )}
          </td>
          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#4B5563' }}>
            {scheme.trigger_event || '—'}
          </td>
          <td style={{ padding: '14px 16px' }}>
            <Badge
              status={scheme.is_active ? 'Active' : 'Inactive'}
              style={{
                background: scheme.is_active ? '#D1FAE5' : '#F3F4F6',
                color: scheme.is_active ? '#065F46' : '#6B7280',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
              }}
            />
          </td>
          <td style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => onEdit(scheme)}
                title="Edit"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                  color: '#6B7280',
                  fontSize: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                  e.currentTarget.style.color = '#1F2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                ✏️
              </button>
              {scheme.is_active ? (
                <button
                  onClick={() => onToggleStatus(scheme.scheme_code, false)}
                  title="Deactivate"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    transition: 'background 0.15s',
                    color: '#EF4444',
                    fontSize: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                    e.currentTarget.style.color = '#B91C1C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#EF4444';
                  }}
                >
                  ⏹
                </button>
              ) : (
                <button
                  onClick={() => onToggleStatus(scheme.scheme_code, true)}
                  title="Activate"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    transition: 'background 0.15s',
                    color: '#10B981',
                    fontSize: '16px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#D1FAE5';
                    e.currentTarget.style.color = '#065F46';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#10B981';
                  }}
                >
                  ▶️
                </button>
              )}
              <button
                onClick={() => onDelete(scheme.scheme_code)}
                title="Delete (deactivate)"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                  color: '#6B7280',
                  fontSize: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEE2E2';
                  e.currentTarget.style.color = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}