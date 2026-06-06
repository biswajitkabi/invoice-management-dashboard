import React from 'react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

const Pagination: React.FC<Props> = ({ page, totalPages, total, limit, onPageChange }) => {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const btn = (label: string | number, active: boolean, disabled: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 36,
        height: 36,
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        backgroundColor: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : disabled ? '#9ca3af' : '#374151',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );

  const pages: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>
        Showing {from}–{to} of {total}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {btn('‹', false, page === 1, () => onPageChange(page - 1))}
        {pages[0] > 1 && btn(1, false, false, () => onPageChange(1))}
        {pages[0] > 2 && <span style={{ alignSelf: 'center', color: '#9ca3af' }}>…</span>}
        {pages.map((p) => btn(p, p === page, false, () => onPageChange(p)))}
        {pages[pages.length - 1] < totalPages - 1 && <span style={{ alignSelf: 'center', color: '#9ca3af' }}>…</span>}
        {pages[pages.length - 1] < totalPages && btn(totalPages, false, false, () => onPageChange(totalPages))}
        {btn('›', false, page === totalPages, () => onPageChange(page + 1))}
      </div>
    </div>
  );
};

export default Pagination;