import { Controller, Get, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.customersService.getSummary();
  }

  @Get(':name/profile')
  getProfile(@Param('name') name: string) {
    return this.customersService.getCustomerProfile(
      decodeURIComponent(name),
    );
  }
}