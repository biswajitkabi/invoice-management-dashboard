import {
  IsString,
  IsNumber,
  IsEnum,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';
import { InvoiceStatus } from '../schemas/invoice.schema';

export class CreateInvoiceDto {
  @IsString()
  customer: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn([0, 3, 5, 18, 28])
  taxRate: number;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;
}