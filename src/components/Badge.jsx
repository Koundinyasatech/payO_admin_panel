// src/components/Badge.jsx
export function Badge({ status, style = {} }) {
  const getStatusStyle = (s) => {
    const statusMap = {
      Active: { background: '#D1FAE5', color: '#065F46' },
      Inactive: { background: '#F3F4F6', color: '#6B7280' },
      Approved: { background: '#D1FAE5', color: '#065F46' },
      Rejected: { background: '#FEE2E2', color: '#991B1B' },
      Pending: { background: '#FEF3C7', color: '#92400E' },
      'In Review': { background: '#E0F2FE', color: '#1E40AF' },
      Failed: { background: '#FEE2E2', color: '#991B1B' },
      Paid: { background: '#D1FAE5', color: '#065F46' },
    };
    return statusMap[s] || { background: '#E5E7EB', color: '#374151' };
  };

  const defaultStyle = getStatusStyle(status);
  return (
    <span
      className="badge"
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        ...defaultStyle,
        ...style,
      }}
    >
      {status}
    </span>
  );
}