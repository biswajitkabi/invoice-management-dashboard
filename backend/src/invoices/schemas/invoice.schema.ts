import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
  SENT = 'Sent',
  UNPAID = 'Unpaid',
  OVERDUE = 'Overdue',
  PAID = 'Paid',
  VOID = 'Void',
  DRAFT = 'Draft',
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true, index: true })
  invoiceId: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  // Denormalized for fast display without populate on list views
  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: [0, 3, 5, 18, 28] })
  taxRate: number;

  @Prop({ required: true, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ required: true, enum: Object.values(InvoiceStatus) })
  status: InvoiceStatus;

  @Prop({ required: true })
  issueDate: string;

  @Prop({ required: true, index: true })
  dueDate: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Compound indexes for the most common query patterns
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ customer: 1, issueDate: 1 });
InvoiceSchema.index({ amount: 1 });
InvoiceSchema.index({ issueDate: 1 });