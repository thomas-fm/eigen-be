import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Book } from '@prisma/client';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { BookService } from './book.service';

@Controller('api/v1/books')
export class BookController {
  constructor(private bookService: BookService) {}
  @Get()
  @UseInterceptors(TransformInterceptor)
  async getBooks(): Promise<Book[]> {
    return await this.bookService.getBooks();
  }
}
