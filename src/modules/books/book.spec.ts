import { PrismaService } from 'src/prisma-client/prisma.service';
import { BookService } from './book.service';

describe('BookController', () => {
  let bookService: BookService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    prismaService = new PrismaService();
    bookService = new BookService(prismaService);
  });

  describe('find all books', () => {
    it('should return array of books', async () => {
      prismaService.book.findMany = jest.fn().mockReturnValueOnce([
        {
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
        },
        {
          code: 'SHR-1',
          title: 'A Study in Scarlet',
          author: 'Arthur Conan Doyle',
          stock: 1,
        },
        {
          code: 'TW-11',
          title: 'Twilight',
          author: 'Stephenie Meyer',
          stock: 1,
        },
      ]);

      expect((await bookService.getBooks()).length).toBe(3);
    });
  });
});
