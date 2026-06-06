import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api/api';
import { CustomerProfile } from '../types';
import StatusBadge from '../components/StatusBadge';

const CustomerProfilePage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    customersApi.getProfile(name)
      .then((r) => setProfile(r.data))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <p style={{ textAlign: 'center', color: '#9ca3af', padding: 48 }}>Loading…</p>;
  if (!profile) return <p style={{ textAlign: 'center', color: '#dc2626', padding: 48 }}>Customer not found</p>;

  const { metrics } = profile;

  const card = (label: string, value: string) => (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 18px',
      flex: 1, minWidth: 120, backgroundColor: '#fff',
    }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );

  const statusPill = (label: string, count: number, color: string) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 12px', borderRadius: 999, backgroundColor: '#f3f4f6',
      fontSize: 13, fontWeight: 500,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
      {label} <strong>{count}</strong>
    </span>
  );

  const initials = profile.customer.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        <button onClick={() => navigate('/invoices')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, padding: 0 }}>
          Invoices
        </button>
        {' / '}Customer
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 16,
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{profile.customer}</h1>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{profile.company}</div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {card('Total Billed', `₹${metrics.totalBilled.toLocaleString()}`)}
        {card('Total Tax', `₹${metrics.totalTax.toLocaleString()}`)}
        {card('Outstanding', `₹${metrics.outstanding.toLocaleString()}`)}
        {card('# Invoices', metrics.invoiceCount.toString())}
      </div>

      {/* Status breakdown */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {statusPill('Paid', metrics.paid, '#16a34a')}
        {statusPill('Unpaid', metrics.unpaid, '#ca8a04')}
        {statusPill('Overdue', metrics.overdue, '#dc2626')}
        {statusPill('Draft', metrics.draft, '#9ca3af')}
      </div>

      {/* Invoice history */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Invoice History</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Invoice', 'Amount', 'Total', 'Status', 'Issued', 'Due'].map((h) => (
                <th key={h} style={{
                  padding: '9px 12px', textAlign: h === 'Amount' || h === 'Total' ? 'right' : 'left',
                  fontSize: 12, fontWeight: 600, color: '#374151',
                  backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.invoices.map((inv) => (
              <tr key={inv._id}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
              >
                <td style={{ padding: '9px 12px', fontSize: 13, color: '#2563eb', fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>{inv.invoiceId}</td>
                <td style={{ padding: '9px 12px', fontSize: 13, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>₹{inv.amount.toLocaleString()}</td>
                <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 500, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>₹{inv.total.toLocaleString()}</td>
                <td style={{ padding: '9px 12px', borderBottom: '1px solid #f3f4f6' }}><StatusBadge status={inv.status} /></td>
                <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{inv.issueDate}</td>
                <td style={{ padding: '9px 12px', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{inv.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerProfilePage;