import { Module } from '@nestjs/common';
import { GeminiModule } from './gemini/gemini.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
