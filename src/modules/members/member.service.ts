import { BorrowHistory, Member } from '@prisma/client';
import { Injectable } from '@nestjs/common/decorators';
import { PrismaService } from 'src/prisma-client/prisma.service';
import { BookService } from '../books/book.service';
import { DAY_MAX_RETURN, DAY_PENALIZED, MAX_BOOK } from 'src/constants';
import { CustomException } from 'src/common/http-exception';
import { HttpStatus } from '@nestjs/common';
import { BorrowBookDto, ReturnBookDto } from './member.dto';
@Injectable()
export class MemberService {
  constructor(
    private prisma: PrismaService,
    private bookService: BookService,
  ) {}

  async isValidToBorrow(
    borrowHisotries: BorrowHistory[],
    borrowBookDto: BorrowBookDto,
  ): Promise<{ valid: boolean; reason?: string }> {
    // check if the total attempted borrow + unreturned book is less than max allowed book
    const { borrowBook } = borrowBookDto;
    const borrowAttempt = borrowBook.reduce((acc, curr) => acc + curr.count, 0);

    const unReturnedBooks = borrowHisotries.filter(
      (book) => book.returnDate == null,
    );

    if (unReturnedBooks.length + borrowAttempt > MAX_BOOK)
      return {
        valid: false,
        reason: `Cant borrow more than ${MAX_BOOK} books`,
      };

    const currenDate = new Date();
    for (const borrowHist of borrowHisotries) {
      const { borrowDate, returnDate } = borrowHist;
      // check if member is in the penalized period
      if (returnDate) {
        const returnDiff = returnDate.getTime() - borrowDate.getTime();
        const dayReturnDiff = Math.floor(returnDiff / (1000 * 3600 * 24));

        if (dayReturnDiff <= 7) continue;
        const penalizedDiff = currenDate.getTime() - returnDate.getTime();
        const dayPenalizedDiff = Math.floor(penalizedDiff / (1000 * 3600 * 24));
        const isPenalizedPeriod = dayPenalizedDiff < DAY_PENALIZED;

        if (isPenalizedPeriod)
          return {
            valid: false,
            reason: `Currently being penalized`,
          };
      } else {
        // check if there is still unreturned books after due period
        const unreturnedDiff = currenDate.getTime() - borrowDate.getTime();
        const dayUnreturnedDiff = Math.floor(
          unreturnedDiff / (1000 * 3600 * 24),
        );

        if (dayUnreturnedDiff >= DAY_MAX_RETURN)
          return {
            valid: false,
            reason: `Must return the previous book first`,
          };
      }
    }

    return {
      valid: true,
    };
  }

  async borrowBooks(borrowBookDto: BorrowBookDto): Promise<void> {
    const { borrowBook, memberCode } = borrowBookDto;
    const borrowHistories =
      await this.bookService.getLatestBorrowedBook(memberCode);

    // checking member penalized status
    const { valid, reason } = await this.isValidToBorrow(
      borrowHistories,
      borrowBookDto,
    );

    if (!valid) throw new CustomException(reason, HttpStatus.BAD_REQUEST);

    return await this.bookService.borrowBooks(borrowBook, memberCode);
  }

  async returnBook(returnBookDto: ReturnBookDto): Promise<void> {
    const { returnBook, memberCode } = returnBookDto;

    // fetch all unreturned books
    const bookCodes = returnBook.map((b) => b.code);
    const totalReturned = returnBook.reduce((acc, curr) => acc + curr.count, 0);
    const unReturnedBooks = await this.bookService.getUnreturnedBooks(
      bookCodes,
      memberCode,
    );

    // filter unreturned books by attempted to return book
    // if there are more than one books with borrowed in different time
    // then attempt to return the least recent borrowed book
    const filteredUnreturnedBooks = [];
    for (const book of returnBook) {
      const { code, count } = book;
      const unReturnedByCode = unReturnedBooks
        .filter((book) => book.bookCode == code)
        .sort((a, b) => a.borrowDate.getTime() - b.borrowDate.getTime());

      const filteredUnreturned = unReturnedByCode.slice(0, count);
      filteredUnreturnedBooks.push(...filteredUnreturned);
    }

    // validate the member has the borrowed books
    if (totalReturned != filteredUnreturnedBooks.length)
      throw new CustomException(
        'Borrow history does not exist',
        HttpStatus.NOT_FOUND,
      );

    // construct update query
    const prismmaUpdateStock = returnBook.map((book) => {
      return this.prisma.book.update({
        where: {
          code: book.code,
        },
        data: {
          stock: {
            increment: book.count,
          },
        },
      });
    });

    // update book stock and update return date
    await this.prisma.$transaction([
      ...prismmaUpdateStock,
      this.prisma.borrowHistory.updateMany({
        where: {
          id: {
            in: filteredUnreturnedBooks.map((book) => book.id),
          },
        },
        data: {
          returnDate: new Date(),
        },
      }),
    ]);
  }

  async getMemberandBooks(): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      include: {
        borrowHistory: {
          where: {
            returnDate: { equals: null },
          },
        },
      },
    });
    return members.map((member) => {
      return {
        ...member,
        numBorrowed: member.borrowHistory.length,
      };
    });
  }
}
