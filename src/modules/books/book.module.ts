import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { PrismaService } from 'src/prisma-client/prisma.service';

@Module({
  exports: [BookService],
  controllers: [BookController],
  providers: [BookService, PrismaService],
})
export class BooksModule {}
