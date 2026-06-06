import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../api/api';
import { Summary } from '../types';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersApi.getSummary()
      .then((r) => setSummary(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', color: '#9ca3af', padding: 48 }}>Loading…</p>;
  if (!summary) return null;

  const maxBilled = summary.top5Customers[0]?.totalBilled ?? 1;

  const card = (label: string, value: string) => (
    <div style={{
      backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: 20, flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Summary</h1>
        <button
          onClick={() => navigate('/invoices')}
          style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}
        >
          ← Invoices
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {card('Total Billed', `₹${summary.totalBilled.toLocaleString()}`)}
        {card('Total Tax', `₹${summary.totalTax.toLocaleString()}`)}
        {card('# Invoices', summary.invoiceCount.toLocaleString())}
        {card('# Customers', summary.customerCount.toLocaleString())}
      </div>

      {/* Top 5 customers */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Top Customers by Value</h2>
        {summary.top5Customers.map((c, i) => (
          <div key={c.customer} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <button
                onClick={() => navigate(`/customers/${encodeURIComponent(c.customer)}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1e40af', padding: 0 }}
              >
                {i + 1}. {c.customer}
              </button>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                ₹{c.totalBilled.toLocaleString()} · {c.invoiceCount} invoices
              </span>
            </div>
            <div style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', borderRadius: 4,
                  width: `${(c.totalBilled / maxBilled) * 100}%`,
                  backgroundColor: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][i],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryPage;