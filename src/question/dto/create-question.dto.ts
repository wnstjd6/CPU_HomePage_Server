import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString({ message: '질문은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '질문은 필수 입력 필드입니다.' })
  @MinLength(5, { message: '질문은 최소 5자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '질문은 최대 1000자까지 가능합니다.' })
  question!: string;
}
