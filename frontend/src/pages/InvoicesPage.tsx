import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi } from '../api/api';
import { Invoice, InvoiceQuery, InvoiceStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import InvoiceModal from '../components/InvoiceModal';
import toast from 'react-hot-toast';

const STATUSES: InvoiceStatus[] = ['Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft'];

const defaultQuery: InvoiceQuery = {
  page: 1, limit: 20, search: '', status: '', customer: '',
  issueDateFrom: '', issueDateTo: '', dueDateFrom: '', dueDateTo: '',
  sortBy: 'issueDate', sortOrder: 'desc',
};

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [query, setQuery] = useState<InvoiceQuery>(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      Object.entries(query).forEach(([k, v]) => { if (v !== '' && v !== 0) params[k] = v; });
      const { data } = await invoicesApi.getAll(params);
      setInvoices(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const setSort = (field: string) => {
    setQuery((q) => ({
      ...q,
      sortBy: field,
      sortOrder: q.sortBy === field && q.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const sortIcon = (field: string) => {
    if (query.sortBy !== field) return ' ↕';
    return query.sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete invoice ${id}?`)) return;
    try {
      await invoicesApi.delete(id);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch {
      toast.error('Delete failed');
    }
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600,
    color: '#374151', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: 13, color: '#374151',
    borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Invoices</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/summary')}
            style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            Summary
          </button>
          <button
            onClick={() => { setEditInvoice(null); setShowModal(true); }}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 6, backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            + New invoice
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Search invoice / customer…"
            value={query.search}
            onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
          />
          <select
            value={query.status}
            onChange={(e) => setQuery({ ...query, status: e.target.value, page: 1 })}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, backgroundColor: showFilters ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            {showFilters ? '▲' : '▼'} Filters
          </button>
          {(query.search || query.status || query.issueDateFrom || query.dueDateFrom) && (
            <button
              onClick={() => setQuery(defaultQuery)}
              style={{ padding: '8px 14px', border: '1px solid #fca5a5', borderRadius: 6, backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
            >
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Issue Date From</label>
              <input type="date" value={query.issueDateFrom}
                onChange={(e) => setQuery({ ...query, issueDateFrom: e.target.value, page: 1 })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Issue Date To</label>
              <input type="date" value={query.issueDateTo}
                onChange={(e) => setQuery({ ...query, issueDateTo: e.target.value, page: 1 })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Due Date From</label>
              <input type="date" value={query.dueDateFrom}
                onChange={(e) => setQuery({ ...query, dueDateFrom: e.target.value, page: 1 })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Due Date To</label>
              <input type="date" value={query.dueDateTo}
                onChange={(e) => setQuery({ ...query, dueDateTo: e.target.value, page: 1 })}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => setSort('invoiceId')}>Invoice{sortIcon('invoiceId')}</th>
                <th style={thStyle}>Customer</th>
                <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSort('amount')}>Amount{sortIcon('amount')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tax%</th>
                <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSort('total')}>Total{sortIcon('total')}</th>
                <th style={thStyle} onClick={() => setSort('issueDate')}>Issued{sortIcon('issueDate')}</th>
                <th style={thStyle} onClick={() => setSort('dueDate')}>Due{sortIcon('dueDate')}</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading…</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 32, color: '#9ca3af' }}>No invoices found</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ ...tdStyle, color: '#2563eb', fontWeight: 500 }}>{inv.invoiceId}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => navigate(`/customers/${encodeURIComponent(inv.customer)}`)}
                        style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}
                      >
                        {inv.customer}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>₹{inv.amount.toLocaleString()}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#6b7280' }}>{inv.taxRate}%</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>₹{inv.total.toLocaleString()}</td>
                    <td style={tdStyle}>{inv.issueDate}</td>
                    <td style={tdStyle}>{inv.dueDate}</td>
                    <td style={tdStyle}><StatusBadge status={inv.status} /></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setEditInvoice(inv); setShowModal(true); }}
                          style={{ fontSize: 12, padding: '3px 10px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff' }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(inv.invoiceId)}
                          style={{ fontSize: 12, padding: '3px 10px', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', background: '#fff', color: '#dc2626' }}
                        >Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '0 16px' }}>
          <Pagination
            page={meta.page} totalPages={meta.totalPages}
            total={meta.total} limit={meta.limit}
            onPageChange={(p) => setQuery({ ...query, page: p })}
          />
        </div>
      </div>

      {showModal && (
        <InvoiceModal
          invoice={editInvoice}
          onClose={() => setShowModal(false)}
          onSaved={fetchInvoices}
        />
      )}
    </div>
  );
};

export default InvoicesPage;