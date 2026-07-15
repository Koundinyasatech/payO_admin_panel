import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { StatsSummary } from '../components/StatsSummary';
import { ExportButton } from '../components/ExportButton';
import { UserTableRow } from '../components/UserTableRow';
import { UserModal } from '../components/UserModal';
import { KycQuickModal } from '../components/KycQuickModal';

export default function Users() {
  const {
    loading, error, totals,
    search, setSearch,
    fKYC, setFKYC,
    pagedUsers, filtered,
    page, setPage,
    totalPages, per,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [kycUser, setKycUser] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Users</h2>
          <p>All registered PayO users with KYC status, wallet balance and bank details.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <StatsSummary totals={totals} loading={loading} />
          <ExportButton />
        </div>
      </div>

      {error && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', marginBottom:18, color:'#DC2626', fontSize:13 }}>
          Error: {error}
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <div className="search-field">
            <svg width="14" height="14" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by name, email, mobile or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>
          <select className="filter-select" value={fKYC} onChange={e => { setFKYC(e.target.value); setPage(1); }}>
            <option value="All">All Users</option>
            <option value="Verified">KYC Verified</option>
            <option value="Pending">KYC Pending</option>
          </select>
          <div className="filter-count">{loading ? '—' : `${filtered.length} users`}</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Wallet Address</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map(u => (
                <UserTableRow
                  key={u._id}
                  user={u}
                  onView={setSelectedUser}
                  onKyc={setKycUser}
                />
              ))}
            </tbody>
          </table>
          {!loading && pagedUsers.length === 0 && <div className="empty">No users found matching your filters.</div>}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="pagination">
            <div className="pag-info">Showing {Math.min((page-1)*per+1, filtered.length)}-{Math.min(page*per, filtered.length)} of {filtered.length}</div>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>&#8249;</button>
              {Array.from({ length: totalPages }, (_,i) => (
                <button key={i+1} className={`pag-btn${page===i+1?' act':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button className="pag-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>&#8250;</button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {kycUser && <KycQuickModal user={kycUser} onClose={() => setKycUser(null)} />}
    </div>
  );
}