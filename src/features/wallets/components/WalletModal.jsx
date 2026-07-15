export function WalletModal({ wallet, onClose, onToggle }) {
  if (!wallet) return null;
  const isActive = wallet.status === 'Active';

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: wallet.color, width: 42, height: 42, borderRadius: 11, fontSize: 15 }}>{wallet.initials}</div>
            <div><h3>{wallet.user}</h3><div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{String(wallet.userId).slice(-12)}</div></div>
          </div>
          <button className="btn btn-ghost icon-btn" onClick={onClose}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div style={{ background: isActive ? 'linear-gradient(135deg,#0D1B3E,#1E3A6E)' : 'linear-gradient(135deg,#374151,#4B5563)', borderRadius: 14, padding: '22px 24px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>PYO Token Balance</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>
              {wallet.tokens.toLocaleString()} <span style={{ fontSize: 18, opacity: 0.7 }}>PYO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, opacity: 0.65, fontSize: 12 }}>
              <span>KYC: {wallet.kycStatus}</span>
              <span style={{ background: isActive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', padding: '2px 10px', borderRadius: 20, color: isActive ? '#6EE7B7' : '#FCA5A5', fontWeight: 600 }}>
                {isActive ? '● Active' : '● Deactivated'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[['Email', wallet.email || '—'], ['Mobile', wallet.mobile || '—']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--gray-100)', borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className={`btn ${isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => { onToggle(wallet.userId); onClose(); }}>
            {isActive ? '🔒 Deactivate Wallet' : '🔓 Activate Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}