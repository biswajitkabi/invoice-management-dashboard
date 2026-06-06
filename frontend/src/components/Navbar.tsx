import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();

  const linkStyle = (path: string): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
    color: pathname.startsWith(path) ? '#fff' : '#374151',
    backgroundColor: pathname.startsWith(path) ? '#2563eb' : 'transparent',
    transition: 'all 0.15s',
  });

  return (
    <nav
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 56,
        gap: 8,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 18, color: '#1e40af', marginRight: 24 }}>
        📄 InvoiceApp
      </span>
      <Link to="/invoices" style={linkStyle('/invoices')}>
        Invoices
      </Link>
      <Link to="/summary" style={linkStyle('/summary')}>
        Summary
      </Link>
    </nav>
  );
};

export default Navbar;