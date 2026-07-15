import { useState } from 'react';
import { useWallets } from '../hooks/useWallets';
import { WalletModal } from '../components/WalletModal';

// Local Skeleton (or import from shared)
function Skeleton({ w = '100%', h = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg,var(--skeleton-a,#E2E8F0) 25%,var(--skeleton-b,#F1F5F9) 50%,var(--skeleton-a,#E2E8F0) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }}/>
  );
}

export default function Wallets() {
  const {
    loading,
    tab,
    search,
    active,
    deactivated,
    list,
    setTab,
    setSearch,
    toggleWallet,
  } = useWallets();

  const [selectedWallet, setSelectedWallet] = useState(null);

  return (
    <div className="page">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="page-header">
        <div className="page-header-left"><h2>Wallets</h2><p>Monitor PayO token wallets and user activity.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
        {[
          { label: 'Active Wallets', value: active.length, bg: '#F0FDF4', e: '✅', color: '#059669' },
          { label: 'Deactivated Wallets', value: deactivated.length, bg: '#FEF2F2', e: '🔒', color: '#DC2626' },
          { label: 'Total Users', value: active.length + deactivated.length, bg: '#EFF6FF', e: '👥', color: '#2563EB' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-top">
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 26 }}>{loading ? '—' : s.value}</div>
              </div>
              <div className="stat-icon" style={{ background: s.bg, fontSize: 22 }}>{s.e}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--gray-200)' }}>
          {[['active', 'Active', '#059669'], ['deactivated', 'Deactivated', '#DC2626']].map(([k, l, c]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: '13px 20px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13.5, fontWeight: tab === k ? 600 : 500, color: tab === k ? c : 'var(--gray-400)', borderBottom: tab === k ? `2px solid ${c}` : '2px solid transparent', transition: 'all 0.18s' }}>
              {l} &nbsp;<span style={{ background: tab === k ? c + '22' : 'var(--gray-100)', color: tab === k ? c : 'var(--gray-400)', borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {k === 'active' ? active.length : deactivated.length}
              </span>
            </button>
          ))}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 14px' }}>
            <div className="search-field" style={{ maxWidth: 200 }}>
              <svg width="13" height="13" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>User ID</th><th>KYC Status</th><th>Token Balance</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Skeleton w={34} h={34} radius={8}/><Skeleton w={100} h={12} radius={4}/></div></td>
                      <td><Skeleton w={100} h={12} radius={4}/></td>
                      <td><Skeleton w={70} h={22} radius={20}/></td>
                      <td><Skeleton w={80} h={14} radius={4}/></td>
                      <td><div style={{ display: 'flex', gap: 6 }}><Skeleton w={50} h={28} radius={8}/><Skeleton w={80} h={28} radius={8}/></div></td>
                    </tr>
                  ))
                : list.map(w => (
                    <tr key={w.userId}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar" style={{ background: w.color }}>{w.initials}</div>
                          <div><div className="uname">{w.user}</div><div className="uid">{w.email}</div></div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--gray-600)', fontFamily: 'monospace' }}>{String(w.userId).slice(-14)}</td>
                      <td>
                        <span className={`badge ${w.kycStatus === 'Approved' ? 'b-approved' : w.kycStatus === 'Failed' ? 'b-failed' : 'b-pending'}`}>{w.kycStatus}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: w.tokens > 0 ? 'var(--navy)' : 'var(--gray-400)' }}>{w.tokens.toLocaleString()}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 6 }}>PYO</span>
                        </div>
                      </td>
                      <td>
                        <div className="act-group">
                          <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 11px' }} onClick={() => setSelectedWallet(w)}>View</button>
                          <button className={`btn ${w.status === 'Active' ? 'btn-danger' : 'btn-success'}`} style={{ fontSize: 12, padding: '5px 11px' }} onClick={() => toggleWallet(w.userId)}>
                            {w.status === 'Active' ? '🔒 Deactivate' : '🔓 Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && list.length === 0 && <div className="empty">No {tab} wallets found.</div>}
        </div>
      </div>

      {selectedWallet && <WalletModal wallet={selectedWallet} onClose={() => setSelectedWallet(null)} onToggle={toggleWallet} />}
    </div>
  );
}