import { STATUS_MAP } from '../utils/constants';

export function Badge({ status }) {
  const cls = STATUS_MAP[status] || 'b-pending';
  return <span className={`badge ${cls}`}>{status}</span>;
}