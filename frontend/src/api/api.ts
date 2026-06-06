import axios from 'axios';
import {
  Invoice,
  PaginatedResponse,
  Customer,
  Summary,
  CustomerProfile,
  InvoiceFormData,
  InvoiceQuery,
} from '../types';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:3001/api',
});

export const invoicesApi = {
  getAll: (query: Partial<InvoiceQuery>) =>
    client.get<PaginatedResponse<Invoice>>('/invoices', { params: query }),

  getOne: (id: string) => client.get<Invoice>(`/invoices/${id}`),

  create: (data: InvoiceFormData) => client.post<Invoice>('/invoices', data),

  update: (id: string, data: Partial<InvoiceFormData>) =>
    client.put<Invoice>(`/invoices/${id}`, data),

  delete: (id: string) => client.delete(`/invoices/${id}`),
};

export const customersApi = {
  getAll: () => client.get<Customer[]>('/customers'),
  getSummary: () => client.get<Summary>('/customers/summary'),
  getProfile: (name: string) =>
    client.get<CustomerProfile>(`/customers/${encodeURIComponent(name)}/profile`),
};