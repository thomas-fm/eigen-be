import { PrismaService } from 'src/prisma-client/prisma.service';
import { MemberService } from './member.service';
import { BookService } from '../books/book.service';

describe('BookController', () => {
  let bookService: BookService;
  let prismaService: PrismaService;
  let memberService: MemberService;

  beforeEach(async () => {
    prismaService = new PrismaService();
    bookService = new BookService(prismaService);
    memberService = new MemberService(prismaService, bookService);
  });

  describe('find all members', () => {
    it('should return array of members', async () => {
      prismaService.member.findMany = jest.fn().mockReturnValueOnce([
        {
          code: 'M001',
          name: 'Angga',
          borrowHistory: [],
        },
        {
          code: 'M002',
          name: 'Ferry',
          borrowHistory: [],
        },
      ]);

      expect((await memberService.getMemberandBooks()).length).toBe(2);
    });
  });
});
