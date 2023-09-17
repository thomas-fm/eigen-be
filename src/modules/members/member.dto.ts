import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class BookCount {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  count: number;
}

export class BorrowBookDto {
  @ApiProperty({
    isArray: true,
    type: BookCount,
  })
  borrowBook: BookCount[];

  @ApiProperty()
  @IsString()
  memberCode: string;
}

export class ReturnBookDto {
  @ApiProperty({
    isArray: true,
    type: BookCount,
  })
  returnBook: BookCount[];

  @ApiProperty()
  @IsString()
  memberCode: string;
}
