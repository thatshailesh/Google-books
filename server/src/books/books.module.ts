import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(
      { isGlobal: true}
    ),
    HttpModule
  ],
  providers: [ConfigService, BooksService],
  controllers: [BooksController]
})
export class BooksModule {}
