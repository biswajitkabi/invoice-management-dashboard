import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/invoice-dashboard';
const DATA_FILE = path.resolve(__dirname, '../seed-data.json');

interface RawInvoice {
  invoiceId: string;
  customer: string;
  company: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  company: { type: String, required: true },
});

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customer: String,
  company: String,
  amount: Number,
  taxRate: Number,
  tax: Number,
  total: Number,
  status: String,
  issueDate: String,
  dueDate: String,
});

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  const CustomerModel = mongoose.model('Customer', CustomerSchema);
  const InvoiceModel = mongoose.model('Invoice', InvoiceSchema);

  console.log('Dropping existing collections...');
  await CustomerModel.deleteMany({});
  await InvoiceModel.deleteMany({});

  console.log('Reading seed data...');
  const raw: RawInvoice[] = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  // Build unique customer map
  const customerMap = new Map<string, string>(); // name -> company
  for (const r of raw) {
    if (!customerMap.has(r.customer)) {
      customerMap.set(r.customer, r.company);
    }
  }

  console.log(`Seeding ${customerMap.size} customers...`);
  const customerDocs = await CustomerModel.insertMany(
    Array.from(customerMap.entries()).map(([name, company]) => ({ name, company })),
  );

  const customerIdMap = new Map<string, mongoose.Types.ObjectId>();
  for (const doc of customerDocs) {
    customerIdMap.set((doc as any).name, (doc as any)._id);
  }

  console.log(`Seeding ${raw.length} invoices...`);
  const invoices = raw.map((r) => ({
    invoiceId: r.invoiceId,
    customerId: customerIdMap.get(r.customer),
    customer: r.customer,
    company: r.company,
    amount: r.amount,
    taxRate: r.taxRate,
    tax: r.tax,
    total: r.total,
    status: r.status,
    issueDate: r.issueDate,
    dueDate: r.dueDate,
  }));

  await InvoiceModel.insertMany(invoices, { ordered: false });

  console.log('Seed complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});