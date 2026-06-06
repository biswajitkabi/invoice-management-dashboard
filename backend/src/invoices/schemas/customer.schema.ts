import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ required: true })
  company: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);