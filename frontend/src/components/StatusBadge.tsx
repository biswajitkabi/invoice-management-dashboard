import React from 'react';
import { InvoiceStatus } from '../types';

const colors: Record<InvoiceStatus, { bg: string; text: string }> = {
  Paid:    { bg: '#dcfce7', text: '#166534' },
  Sent:    { bg: '#dbeafe', text: '#1e40af' },
  Unpaid:  { bg: '#fef9c3', text: '#854d0e' },
  Overdue: { bg: '#fee2e2', text: '#991b1b' },
  Draft:   { bg: '#f3f4f6', text: '#374151' },
  Void:    { bg: '#f3f4f6', text: '#9ca3af' },
};

interface Props { status: InvoiceStatus; }

const StatusBadge: React.FC<Props> = ({ status }) => {
  const { bg, text } = colors[status] ?? colors.Draft;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;