import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import "dotenv/config"
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { CardsModule } from './cards/cards.module';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    CardsModule, 
    WaitlistModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
