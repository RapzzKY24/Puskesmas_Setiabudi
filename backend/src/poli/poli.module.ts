import { Module } from '@nestjs/common';
import { PoliController } from './poli.controller';
import { PoliService } from './poli.service';
import { AntreanModule } from '../antrean/antrean.module';

@Module({
  imports: [AntreanModule],
  controllers: [PoliController],
  providers: [PoliService],
})
export class PoliModule {}
