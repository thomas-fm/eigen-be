import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { MemberService } from './member.service';
import { Member } from '@prisma/client';
import { BorrowBookDto, ReturnBookDto } from './member.dto';
import { ResponseMessage } from 'src/decorators/response-message.decorator';

@Controller('api/v1/member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Get()
  @UseInterceptors(TransformInterceptor)
  async getMembers(): Promise<Member[]> {
    return await this.memberService.getMemberandBooks();
  }

  @Post('borrow')
  @ResponseMessage('Borrowed successfully')
  @UseInterceptors(TransformInterceptor)
  async borrowBook(@Body() body: BorrowBookDto): Promise<void> {
    return await this.memberService.borrowBooks(body);
  }

  @Post('return')
  @ResponseMessage('Returned succesfully')
  @UseInterceptors(TransformInterceptor)
  async returnBook(@Body() body: ReturnBookDto): Promise<void> {
    return await this.memberService.returnBook(body);
  }
}
