import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import InvoicesPage from './pages/InvoicesPage';
import SummaryPage from './pages/SummaryPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/invoices" replace />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/customers/:name" element={<CustomerProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;