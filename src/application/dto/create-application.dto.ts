import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름은 필수 입력 필드입니다.' })
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(30, { message: '이름은 최대 30자까지 가능합니다.' })
  name!: string;

  @IsString({ message: '학번은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '학번은 필수 입력 필드입니다.' })
  @Matches(/^\d{4,8}$/, {
    message: '학번은 4-8자리 숫자여야 합니다.',
  })
  studentId!: string;

  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '전화번호는 필수 입력 필드입니다.' })
  @Matches(/^01[0-9]-?\d{3,4}-?\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phone!: string;

  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 필드입니다.' })
  @MaxLength(80, { message: '이메일은 최대 80자까지 가능합니다.' })
  email!: string;

  @IsBoolean({ message: '기숙사 선택 여부는 true/false여야 합니다.' })
  isDormitory!: boolean;

  @IsString({ message: '호실은 문자열이어야 합니다.' })
  @ValidateIf((o) => o.isDormitory === true)
  @IsNotEmpty({ message: '기숙사 선택 시 호실은 필수입니다.' })
  @Matches(/^\d{1,4}$/, {
    message: '호실은 1-4자리 숫자여야 합니다.',
  })
  room?: string;

  @IsString({ message: '지원 동기는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '지원 동기는 필수 입력 필드입니다.' })
  @MinLength(10, { message: '지원 동기는 최소 10자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '지원 동기는 최대 1000자까지 가능합니다.' })
  motivation!: string;

  @IsString({ message: '강점/약점은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '강점/약점은 필수 입력 필드입니다.' })
  @MinLength(10, { message: '강점/약점은 최소 10자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '강점/약점은 최대 1000자까지 가능합니다.' })
  strengthWeakness!: string;

  @IsString({ message: '기대 역할은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '기대 역할은 필수 입력 필드입니다.' })
  @MinLength(5, { message: '기대 역할은 최소 5자 이상이어야 합니다.' })
  @MaxLength(400, { message: '기대 역할은 최대 400자까지 가능합니다.' })
  expectedRole!: string;
}
