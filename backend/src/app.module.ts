import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PoliModule } from './poli/poli.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AntreanModule } from './antrean/antrean.module';
import { EResumeModule } from './e-resume/e-resume.module';
import { HistoryModule } from './history/history.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PromosModule } from './promos/promos.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WebsocketModule,
    UsersModule,
    PoliModule,
    AppointmentsModule,
    AntreanModule,
    EResumeModule,
    HistoryModule,
    NotificationsModule,
    PromosModule,
  ],
})
export class AppModule {}
