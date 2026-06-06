export type InvoiceStatus = 'Sent' | 'Unpaid' | 'Overdue' | 'Paid' | 'Void' | 'Draft';

export interface Invoice {
  _id: string;
  invoiceId: string;
  customer: string;
  company: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Customer {
  _id: string;
  name: string;
  company: string;
}

export interface TopCustomer {
  customer: string;
  company: string;
  totalBilled: number;
  invoiceCount: number;
}

export interface Summary {
  totalBilled: number;
  totalTax: number;
  invoiceCount: number;
  customerCount: number;
  top5Customers: TopCustomer[];
}

export interface CustomerProfile {
  customer: string;
  company: string;
  metrics: {
    totalBilled: number;
    totalTax: number;
    outstanding: number;
    invoiceCount: number;
    paid: number;
    unpaid: number;
    overdue: number;
    draft: number;
  };
  invoices: Invoice[];
}

export interface InvoiceFormData {
  customer: string;
  amount: number;
  taxRate: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export interface InvoiceQuery {
  page: number;
  limit: number;
  search: string;
  status: string;
  customer: string;
  issueDateFrom: string;
  issueDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}