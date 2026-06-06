import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceFormData, InvoiceStatus, Customer } from '../types';
import { customersApi, invoicesApi } from '../api/api';
import toast from 'react-hot-toast';

interface Props {
  invoice?: Invoice | null;
  onClose: () => void;
  onSaved: () => void;
}

const TAX_RATES = [0, 3, 5, 18, 28];
const STATUSES: InvoiceStatus[] = ['Draft', 'Sent', 'Unpaid', 'Overdue', 'Paid', 'Void'];

const InvoiceModal: React.FC<Props> = ({ invoice, onClose, onSaved }) => {
  const isEdit = !!invoice;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<InvoiceFormData>({
    customer: invoice?.customer ?? '',
    amount: invoice?.amount ?? 0,
    taxRate: invoice?.taxRate ?? 18,
    status: invoice?.status ?? 'Draft',
    issueDate: invoice?.issueDate ?? '',
    dueDate: invoice?.dueDate ?? '',
  });

  useEffect(() => {
    customersApi.getAll().then((r) => setCustomers(r.data));
  }, []);

  const tax = parseFloat(((form.amount * form.taxRate) / 100).toFixed(2));
  const total = parseFloat((form.amount + tax).toFixed(2));

  const selectedCustomer = customers.find((c) => c.name === form.customer);

  const handleSubmit = async () => {
    if (!form.customer || !form.issueDate || !form.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && invoice) {
        await invoicesApi.update(invoice.invoiceId, form);
        toast.success('Invoice updated!');
      } else {
        await invoicesApi.create(form);
        toast.success('Invoice created!');
      }
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const inp = (label: string, node: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
      {node}
    </div>
  );

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 12, padding: 28,
          width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
          {isEdit ? 'Edit Invoice' : 'New Invoice'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {inp('Customer *',
            <select
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          )}

          {inp('Company (auto-filled)',
            <input
              readOnly
              value={selectedCustomer?.company ?? ''}
              style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Amount *',
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                style={inputStyle}
              />
            )}
            {inp('Tax Rate',
              <select
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: parseInt(e.target.value) })}
                style={inputStyle}
              >
                {TAX_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
              </select>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {inp('Issue Date *',
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                style={inputStyle}
              />
            )}
            {inp('Due Date *',
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                style={inputStyle}
              />
            )}
          </div>

          {inp('Status',
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
              style={inputStyle}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          <div
            style={{
              backgroundColor: '#f0f9ff', borderRadius: 8, padding: '10px 14px',
              display: 'flex', gap: 16, fontSize: 14, color: '#0369a1',
            }}
          >
            <span>Tax: <strong>₹{tax.toLocaleString()}</strong></span>
            <span>·</span>
            <span>Total: <strong>₹{total.toLocaleString()}</strong></span>
            <span style={{ marginLeft: 'auto', color: '#64748b' }}>(computed)</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 6,
              backgroundColor: '#fff', cursor: 'pointer', fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 6,
              backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving…' : 'Save invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;