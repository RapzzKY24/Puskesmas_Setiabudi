import { Controller, Get } from '@nestjs/common';
import { PromosService } from './promos.service';

@Controller('api/promos')
export class PromosController {
  constructor(private readonly promos: PromosService) {}

  @Get()
  findAll() {
    return this.promos.findAll();
  }
}
