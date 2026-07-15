// src/features/kyc/components/SearchBar.jsx
export function SearchBar({ value, onChange }) {
  return (
    <div className="search-field">
      <svg width="14" height="14" fill="none" stroke="var(--gray-400)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        placeholder="Search by name, mobile, email or ID..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}