import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Customer, CustomerDocument } from '../invoices/schemas/customer.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async findAll() {
    return this.customerModel.find().sort({ name: 1 }).lean();
  }

  async getSummary() {
    // Global analytics
    const [globalAgg, customerCount, invoiceCount] = await Promise.all([
      this.invoiceModel.aggregate([
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$total' },
            totalTax: { $sum: '$tax' },
          },
        },
      ]),
      this.customerModel.countDocuments(),
      this.invoiceModel.countDocuments(),
    ]);

    // Top 5 customers by total billed
    const top5 = await this.invoiceModel.aggregate([
      {
        $group: {
          _id: '$customer',
          company: { $first: '$company' },
          totalBilled: { $sum: '$total' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalBilled: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          customer: '$_id',
          company: 1,
          totalBilled: 1,
          invoiceCount: 1,
        },
      },
    ]);

    const global = globalAgg[0] ?? { totalBilled: 0, totalTax: 0 };

    return {
      totalBilled: parseFloat(global.totalBilled.toFixed(2)),
      totalTax: parseFloat(global.totalTax.toFixed(2)),
      invoiceCount,
      customerCount,
      top5Customers: top5,
    };
  }

  async getCustomerProfile(name: string) {
    const customer = await this.customerModel.findOne({ name }).lean();
    if (!customer) throw new NotFoundException(`Customer "${name}" not found`);

    const [invoices, agg] = await Promise.all([
      this.invoiceModel
        .find({ customer: name })
        .sort({ issueDate: -1 })
        .lean(),
      this.invoiceModel.aggregate([
        { $match: { customer: name } },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$total' },
            totalTax: { $sum: '$tax' },
            outstanding: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Unpaid', 'Overdue', 'Sent']] },
                  '$total',
                  0,
                ],
              },
            },
            paid: {
              $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] },
            },
            unpaid: {
              $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, 1, 0] },
            },
            overdue: {
              $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] },
            },
            draft: {
              $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const metrics = agg[0] ?? {
      totalBilled: 0,
      totalTax: 0,
      outstanding: 0,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      draft: 0,
    };

    return {
      customer: customer.name,
      company: customer.company,
      metrics: {
        totalBilled: parseFloat(metrics.totalBilled.toFixed(2)),
        totalTax: parseFloat(metrics.totalTax.toFixed(2)),
        outstanding: parseFloat(metrics.outstanding.toFixed(2)),
        invoiceCount: invoices.length,
        paid: metrics.paid,
        unpaid: metrics.unpaid,
        overdue: metrics.overdue,
        draft: metrics.draft,
      },
      invoices,
    };
  }
}