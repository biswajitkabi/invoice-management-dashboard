import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const { pathname } = useLocation();

  const linkStyle = (path: string): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 14,
    color: pathname.startsWith(path) ? "#fff" : "#374151",
    backgroundColor: pathname.startsWith(path) ? "#2563eb" : "transparent",
    transition: "all 0.15s",
  });

  return (
    <nav
      style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        height: 56,
        gap: 8,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: "#1e40af",
          marginRight: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="2" width="13" height="17" rx="2" fill="#2563eb" />
          <rect x="7" y="6" width="5" height="1.2" rx="0.6" fill="white" />
          <rect x="7" y="9" width="7" height="1.2" rx="0.6" fill="white" />
          <rect x="7" y="12" width="6" height="1.2" rx="0.6" fill="white" />
          <circle cx="18" cy="18" r="5" fill="#16a34a" />
          <path
            d="M15.5 18l1.5 1.5 3-3"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        InvoiceApp
      </span>
      <Link to="/invoices" style={linkStyle("/invoices")}>
        Invoices
      </Link>
      <Link to="/summary" style={linkStyle("/summary")}>
        Summary
      </Link>
    </nav>
  );
};

export default Navbar;
