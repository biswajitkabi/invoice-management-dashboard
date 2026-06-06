import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  private generateInvoiceId(): string {
    const num = Math.floor(1000000 + Math.random() * 9000000);
    return `INV-${num}`;
  }

  async create(dto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const customerDoc = await this.customerModel.findOne({ name: dto.customer });
    if (!customerDoc) {
      throw new NotFoundException(`Customer "${dto.customer}" not found`);
    }

    const tax = parseFloat(((dto.amount * dto.taxRate) / 100).toFixed(2));
    const total = parseFloat((dto.amount + tax).toFixed(2));

    const invoice = new this.invoiceModel({
      invoiceId: this.generateInvoiceId(),
      customerId: customerDoc._id,
      customer: customerDoc.name,
      company: customerDoc.company,
      amount: dto.amount,
      taxRate: dto.taxRate,
      tax,
      total,
      status: dto.status,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
    });

    return invoice.save();
  }

  async findAll(query: QueryInvoiceDto) {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      customer,
      issueDateFrom,
      issueDateTo,
      dueDateFrom,
      dueDateTo,
      sortBy = 'issueDate',
      sortOrder = 'desc',
    } = query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { invoiceId: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (customer) filter.customer = { $regex: customer, $options: 'i' };

    if (issueDateFrom || issueDateTo) {
      filter.issueDate = {};
      if (issueDateFrom) filter.issueDate.$gte = issueDateFrom;
      if (issueDateTo) filter.issueDate.$lte = issueDateTo;
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = dueDateFrom;
      if (dueDateTo) filter.dueDate.$lte = dueDateTo;
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.invoiceModel.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      this.invoiceModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findOne({ invoiceId: id }).lean();
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice as unknown as InvoiceDocument;
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceDocument> {
    const existing = await this.invoiceModel.findOne({ invoiceId: id });
    if (!existing) throw new NotFoundException(`Invoice ${id} not found`);

    const amount = dto.amount ?? existing.amount;
    const taxRate = dto.taxRate ?? existing.taxRate;
    const tax = parseFloat(((amount * taxRate) / 100).toFixed(2));
    const total = parseFloat((amount + tax).toFixed(2));

    let updateData: Record<string, any> = { ...dto, tax, total };

    if (dto.customer && dto.customer !== existing.customer) {
      const customerDoc = await this.customerModel.findOne({ name: dto.customer });
      if (!customerDoc) throw new NotFoundException(`Customer "${dto.customer}" not found`);
      updateData.customerId = customerDoc._id;
      updateData.company = customerDoc.company;
    }

    const updated = await this.invoiceModel
      .findOneAndUpdate({ invoiceId: id }, updateData, { new: true })
      .lean();

    return updated as unknown as InvoiceDocument;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.invoiceModel.findOneAndDelete({ invoiceId: id });
    if (!result) throw new NotFoundException(`Invoice ${id} not found`);
    return { message: `Invoice ${id} deleted` };
  }
}