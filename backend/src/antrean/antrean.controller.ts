import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { AntreanService } from './antrean.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateAntreanStatusRequestDto } from './dto/update-antrean-status-request.dto';

@Controller('api/antrean')
@UseGuards(JwtAuthGuard)
export class AntreanController {
  constructor(private readonly antrean: AntreanService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('poliId') poliId?: string) {
    return this.antrean.findAll(poliId);
  }

  @Get('active')
  getActive(@CurrentUser('id') userId: string) {
    return this.antrean.getActive(userId);
  }

  @Get('me')
  getMyQueueInfo(@CurrentUser('id') userId: string) {
    return this.antrean.getMyQueueInfo(userId);
  }

  @Get('status')
  getStatus(@Query('poliId') poliId: string, @Query('antreanId') antreanId?: string) {
    return this.antrean.getStatus(poliId, antreanId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateAntreanStatusRequestDto,
  ) {
    return this.antrean.updateStatus(id, body.status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.antrean.findOne(id);
  }
}
