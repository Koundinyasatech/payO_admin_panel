import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/StatCard';
import { FilterDropdown } from '../components/FilterDropdown';
import { DonutChart } from '../components/DonutChart';
import { Skeleton } from '../components/Skeleton';
import { statusBadge, getInitials, normalizeStatus, COLORS } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dateFilter,
    loadingStats,
    loadingKyc,
    error,
    totalUsers,
    activeWallets,
    totalTxns,
    payoCirculation,
    referralRewards,
    widgetLoading,
    totalSubmissions,
    pendingKYC,
    approvedKYC,
    rejectedKYC,
    filteredKyc,
    setDateFilter,
  } = useDashboard();

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: '+8.4% this month', up: true,
      color: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      sparkData: [30,42,38,55,48,62,58,72,68,80,76,90],
      loading: widgetLoading,
    },
    {
      label: 'Total Active Wallets',
      value: activeWallets.toLocaleString(),
      change: '+12.1% this month', up: true,
      color: '#10B981', iconBg: 'rgba(16,185,129,0.15)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 3H8L4 7h16l-4-4z"/>
          <circle cx="17" cy="13" r="1" fill="#10B981"/>
        </svg>
      ),
      sparkData: [20,35,30,48,42,58,55,70,65,80,78,92],
      loading: widgetLoading,
    },
    {
      label: 'Total Transactions',
      value: totalTxns.toLocaleString(),
      change: '+5.3% this month', up: true,
      color: '#8B5CF6', iconBg: 'rgba(139,92,246,0.15)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 014-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      ),
      sparkData: [45,52,48,60,55,68,62,75,70,82,78,88],
      loading: widgetLoading,
    },
    {
      label: 'PAYO in Circulation',
      value: payoCirculation.toLocaleString(),
      change: '+3.7% this month', up: true,
      color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0112 8h.5a2.5 2.5 0 010 5H12a2.5 2.5 0 000 5h.5a2.5 2.5 0 002.5-2.5"/>
        </svg>
      ),
      sparkData: [60,55,70,65,80,72,85,78,90,84,95,88],
      loading: widgetLoading,
    },
    {
      label: 'Referral Rewards',
      value: referralRewards.toLocaleString(),
      change: '+18.6% this month', up: true,
      color: '#EC4899', iconBg: 'rgba(236,72,153,0.15)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="#EC4899" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="20 12 20 22 4 22 4 12"/>
          <rect x="2" y="7" width="20" height="5"/>
          <line x1="12" y1="22" x2="12" y2="7"/>
          <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
          <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
        </svg>
      ),
      sparkData: [10,18,14,25,20,32,28,40,36,50,46,60],
      loading: widgetLoading,
    },
  ];

  return (
    <div className="page">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Dashboard</h2>
          <p>Welcome back, Admin! Here's what's happening with PayO KYC today.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/kyc')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          Review KYC
        </button>
      </div>

      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 16px', marginBottom:18, color:'#DC2626', fontSize:13 }}>⚠️ {error}</div>}

      {/* Stat Cards */}
      <div className="stats-widget-row" style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, marginBottom:24 }}>
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="dash-grid">
        {/* KYC Table */}
        <div className="card">
          <div className="card-header">
            <h3>Recent KYC Requests</h3>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <FilterDropdown value={dateFilter} onChange={setDateFilter} />
              <button className="btn btn-outline" style={{ fontSize:12, padding:'5px 12px' }} onClick={() => navigate('/kyc')}>View All</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Documents</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {loadingKyc
                  ? Array(5).fill(0).map((_,i) => (
                      <tr key={i}>
                        <td><div style={{ display:'flex', alignItems:'center', gap:10 }}><Skeleton w={34} h={34} radius={8}/><div><Skeleton w={100} h={12} radius={4} style={{ marginBottom:4 }}/><Skeleton w={60} h={10} radius={4}/></div></div></td>
                        <td><Skeleton w={120} h={20} radius={6}/></td>
                        <td><Skeleton w={80} h={12} radius={4}/></td>
                        <td><Skeleton w={60} h={22} radius={20}/></td>
                      </tr>
                    ))
                  : filteredKyc.slice(0, 7).map((r, idx) => {
                      const name = r.fullName || r.userId?.name || 'Unknown';
                      const userIdStr = r.userId?._id || r._id || '';
                      const status = normalizeStatus(r.status);
                      const initials = getInitials(name);
                      const color = COLORS[idx % COLORS.length];
                      const dateStr = r.createdAt || '';
                      const formatted = dateStr ? new Date(dateStr).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';
                      const docs = [];
                      if (r.aadharFrontUrl) docs.push('🪪 Aadhaar');
                      if (r.panCardUrl)     docs.push('💳 PAN');
                      if (r.passportUrl)    docs.push('📔 Passport');
                      if (r.selfieUrl)      docs.push('🤳 Selfie');
                      return (
                        <tr key={r._id || idx} style={{ cursor:'pointer' }} onClick={() => navigate('/kyc')}>
                          <td>
                            <div className="user-cell">
                              <div className="avatar" style={{ background:color }}>{initials}</div>
                              <div><div className="uname">{name}</div><div className="uid">{String(userIdStr).slice(-8)}</div></div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                              {docs.length === 0
                                ? <span style={{ fontSize:12, color:'var(--gray-400)' }}>—</span>
                                : docs.map(d => <span key={d} className="doc-badge">{d}</span>)}
                            </div>
                          </td>
                          <td style={{ color:'var(--gray-400)', fontSize:13 }}>{formatted}</td>
                          <td>{statusBadge(status)}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
            {!loadingKyc && filteredKyc.length === 0 && <div className="empty">No KYC requests found.</div>}
          </div>
        </div>

        {/* Right column */}
        <div className="right-col">
          <div className="card">
            <div className="card-header"><h3>KYC Overview</h3></div>
            <DonutChart stats={loadingStats ? null : { total: (totalSubmissions || (approvedKYC + pendingKYC + rejectedKYC) || 1), approved: approvedKYC, pending: pendingKYC, rejected: rejectedKYC }} />
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Quick Stats</h3>
            </div>
            <div style={{ padding:'8px 20px 16px', display:'flex', flexDirection:'column', gap:12 }}>
              {loadingStats
                ? Array(3).fill(0).map((_,i) => <Skeleton key={i} h={36} radius={8}/>)
                : [
                    { label:'Total Submissions', value: totalSubmissions.toLocaleString(), color:'#3B82F6' },
                    { label:'Approval Rate',     value: totalSubmissions > 0 ? ((approvedKYC/totalSubmissions)*100).toFixed(1)+'%' : '—', color:'#10B981' },
                    { label:'Pending Review',    value: pendingKYC.toLocaleString(), color:'#F59E0B' },
                  ].map(item => (
                    <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--gray-100)' }}>
                      <span style={{ fontSize:13, color:'var(--gray-600)' }}>{item.label}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:item.color }}>{item.value}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}