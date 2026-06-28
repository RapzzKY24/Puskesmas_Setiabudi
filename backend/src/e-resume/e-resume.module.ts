import { Module } from '@nestjs/common';
import { EResumeController } from './e-resume.controller';
import { EResumeService } from './e-resume.service';

@Module({
  controllers: [EResumeController],
  providers: [EResumeService],
})
export class EResumeModule {}
