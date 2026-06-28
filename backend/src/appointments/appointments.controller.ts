import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { UpdateAppointmentStatusRequestDto } from './dto/update-appointment-status-request.dto';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateAppointmentRequestDto,
  ) {
    return this.appointments.create(userId, body);
  }

  @Get('available-dates')
  getAvailableDates(@Query('poliId') poliId: string) {
    return this.appointments.getAvailableDates(poliId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateAppointmentStatusRequestDto,
  ) {
    return this.appointments.updateStatus(id, body.status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointments.findOne(id);
  }
}
