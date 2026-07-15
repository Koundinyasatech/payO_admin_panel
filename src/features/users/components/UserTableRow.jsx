export function UserTableRow({ user, onView, onKyc }) {
  const { _id, initials, color, name, email, mobile, walletAddress, walletBalance } = user;
  return (
    <tr>
      <td>
        <div className="user-cell">
          <div className="avatar" style={{ background: color }}>{initials}</div>
          <div>
            <div className="uname">{name || '—'}</div>
            <div className="uid">{String(_id).slice(-10)}</div>
          </div>
        </div>
      </td>
      <td style={{ fontSize:13, color:'var(--gray-600)' }}>{email || '—'}</td>
      <td style={{ fontSize:13, color:'var(--gray-600)' }}>{mobile || '—'}</td>
      <td style={{ fontSize:12, fontFamily:'monospace', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {walletAddress || '—'}
      </td>
      <td>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ fontWeight:700, fontSize:13, color:(walletBalance??0)>0?'var(--navy)':'var(--gray-400)' }}>
            {(walletBalance ?? 0).toLocaleString()}
          </span>
          <span style={{ fontSize:10, fontWeight:600, color:'var(--gray-400)', background:'var(--gray-100)', padding:'1px 5px', borderRadius:5 }}>PYO</span>
        </div>
      </td>
      <td>
        <div className="act-group">
          <button onClick={() => onView(user)} className="btn btn-outline" style={{ fontSize:12, padding:'5px 14px' }}>View</button>
          <button onClick={() => onKyc(user)} className="btn btn-outline" style={{ fontSize:12, padding:'5px 14px', background:'#F5F3FF', borderColor:'#C4B5FD', color:'#7C3AED' }}>KYC</button>
        </div>
      </td>
    </tr>
  );
}