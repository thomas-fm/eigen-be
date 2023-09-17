import { Module } from '@nestjs/common';
import { BookService } from '../books/book.service';
import { MemberService } from './member.service';
import { PrismaService } from 'src/prisma-client/prisma.service';
import { MemberController } from './member.controller';
import { BooksModule } from '../books/book.module';

@Module({
  imports: [BooksModule],
  providers: [BookService, MemberService, PrismaService],
  exports: [MemberService],
  controllers: [MemberController],
})
export class MemberModule {}
