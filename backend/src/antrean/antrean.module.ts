import { Module } from '@nestjs/common';
import { AntreanController } from './antrean.controller';
import { AntreanService } from './antrean.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  controllers: [AntreanController],
  providers: [AntreanService],
})
export class AntreanModule {}
