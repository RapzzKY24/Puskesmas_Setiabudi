import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { PoliService } from './poli.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePoliRequestDto } from './dto/create-poli-request.dto';
import { UpdatePoliRequestDto } from './dto/update-poli-request.dto';

@Controller('api/poli')
export class PoliController {
  constructor(private readonly poli: PoliService) {}

  @Get()
  findAll(@Query('all') all?: string, @Query('tanggal') tanggal?: string) {
    return this.poli.findAll(all === 'true', tanggal);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poli.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: CreatePoliRequestDto) {
    return this.poli.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePoliRequestDto,
  ) {
    return this.poli.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.poli.remove(id);
  }
}
