import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { EResumeService } from './e-resume.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateEResumeRequestDto } from './dto/create-e-resume-request.dto';

@Controller('api/e-resume')
@UseGuards(JwtAuthGuard)
export class EResumeController {
  constructor(private readonly resume: EResumeService) {}

  @Get('by-appointment/:appointmentId')
  findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.resume.findByAppointment(appointmentId);
  }

  @Get()
  findByUser(@CurrentUser('id') userId: string) {
    return this.resume.findByUser(userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateEResumeRequestDto,
  ) {
    return this.resume.create(userId, body);
  }
}
