import { IsString, IsNumber, IsEnum, IsIn, IsDateString, Min, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../schemas/invoice.schema';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsIn([0, 3, 5, 18, 28])
  taxRate?: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}