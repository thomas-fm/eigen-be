import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './modules/books/book.module';
import { MemberModule } from './modules/members/member.module';

@Module({
  imports: [BooksModule, MemberModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
