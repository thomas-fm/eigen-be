import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma-client/prisma.service';
import { Book, BorrowHistory } from '@prisma/client';
import { CustomException } from 'src/common/http-exception';
import { MAX_BOOK } from 'src/constants';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}
  async getBooks(): Promise<Book[]> {
    return await this.prisma.book.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
    });
  }

  async addNewBooks(book: Book): Promise<Book> {
    const { code, title, author, stock } = book;
    return await this.prisma.book.create({
      data: {
        code,
        title,
        author,
        stock,
      },
    });
  }

  // Attempt to borrow book
  async borrowBooks(
    bookBorrow: { code: string; count: number }[],
    memberCode: string,
  ): Promise<void> {
    // check if all soon to be borrowed book exist
    const bookcodes = [...new Set(bookBorrow.map((b) => b.code))];
    const bookData = await this.prisma.book.findMany({
      where: {
        code: {
          in: bookcodes,
        },
      },
    });

    if (bookData.length != bookcodes.length)
      throw new CustomException('Book does not exist', HttpStatus.NOT_FOUND);

    // construct updated book
    const mapBookBorrow = bookBorrow.reduce((acc, curr) => {
      acc[curr.code] = curr.count;
      return acc;
    }, {});

    // construct update transactions while checking its stock
    const prismaUpdateBook = bookData.map((book) => {
      const { code, stock } = book;
      if (stock < mapBookBorrow[code])
        throw new CustomException('Book out of stock', HttpStatus.BAD_REQUEST);
      const updatedBook = {
        code: book.code,
        stock: stock - mapBookBorrow[code],
      };

      return this.prisma.book.update({
        where: {
          code: book.code,
        },
        data: updatedBook,
      });
    });

    //generate borrow history
    const borrowedBooks = [];
    for (const book of bookBorrow) {
      for (let i = 0; i < book.count; i++) {
        let currentDate = new Date();
        currentDate = new Date(currentDate.getDate() - 10);
        borrowedBooks.push({
          bookCode: book.code,
          memberCode,
          borrowDate: new Date(),
        });
      }
    }
    // using transcactions
    // in case there is concurrent book borrow
    await this.prisma.$transaction([
      this.prisma.borrowHistory.createMany({
        data: borrowedBooks,
        skipDuplicates: true,
      }),
      ...prismaUpdateBook,
    ]);
  }

  async getLatestBorrowedBook(memberCode: string): Promise<BorrowHistory[]> {
    return this.prisma.borrowHistory.findMany({
      where: {
        memberCode,
      },
      orderBy: {
        borrowDate: 'desc',
      },
      include: {
        book: true,
      },
      take: MAX_BOOK,
    });
  }

  async getUnreturnedBooks(
    bookCodes: string[],
    memberCode: string,
  ): Promise<BorrowHistory[]> {
    return await this.prisma.borrowHistory.findMany({
      where: {
        bookCode: {
          in: bookCodes,
        },
        memberCode,
        returnDate: null,
      },
      orderBy: {
        borrowDate: 'asc',
      },
    });
  }
}
