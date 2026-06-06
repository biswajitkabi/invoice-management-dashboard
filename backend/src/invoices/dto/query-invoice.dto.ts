import { IsOptional, IsString, IsEnum, IsNumberString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { InvoiceStatus } from '../schemas/invoice.schema';

export class QueryInvoiceDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  issueDateFrom?: string;

  @IsOptional()
  @IsString()
  issueDateTo?: string;

  @IsOptional()
  @IsString()
  dueDateFrom?: string;

  @IsOptional()
  @IsString()
  dueDateTo?: string;

  @IsOptional()
  @IsIn(['amount', 'dueDate', 'issueDate', 'total', 'invoiceId'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}