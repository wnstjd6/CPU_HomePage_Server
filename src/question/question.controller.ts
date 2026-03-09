import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionEntity } from './entities/question.entity';

@Controller('question')
  
export class QuestionController {
    /**
     * 모든 질문 데이터 삭제 엔드포인트
     * secret 쿼리 필요 (예: ?secret=0000)
     */
    @Delete('clear')
    @HttpCode(HttpStatus.OK)
    async clearQuestions(
      @Query('secret') secret?: string,
    ): Promise<{ success: boolean; message: string; before?: number; after?: number }> {
      if (secret !== '0000') {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      try {
        const { before, after } = await this.questionService.clearAllQuestions();
        return {
          success: true,
          message: `질문 데이터가 모두 삭제되었습니다. (삭제 전: ${before}, 삭제 후: ${after})`,
          before,
          after,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '질문 전체 삭제에 실패했습니다.';
        return {
          success: false,
          message: errorMessage,
        };
      }
    }
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto): Promise<{
    success: boolean;
    message: string;
    data?: QuestionEntity;
  }> {
    try {
      const data = await this.questionService.create(createQuestionDto);
      return {
        success: true,
        message: '질문이 성공적으로 저장되었습니다.',
        data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '질문 저장에 실패했습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  @Get()
  async getAllQuestions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('secret') secret?: string,
  ): Promise<{
    success: boolean;
    data: QuestionEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNextPage: boolean;
    };
  }> {
    if (secret !== '0000') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(100, Math.max(1, limit));
    const { items, total } = await this.questionService.findAll(
      normalizedPage,
      normalizedLimit,
    );
    return {
      success: true,
      data: items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        hasNextPage: normalizedPage * normalizedLimit < total,
      },
    };
  }

  @Get(':id')
  async getQuestionById(@Param('id', ParseIntPipe) id: number): Promise<{
    success: boolean;
    data?: QuestionEntity;
    message?: string;
  }> {
    try {
      const data = await this.questionService.findOne(id);
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '질문을 찾을 수 없습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
      
  @Delete(':id')
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Query('secret') secret?: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (secret !== '0000') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    try {
      await this.questionService.remove(id);
      return {
        success: true,
        message: '질문이 삭제되었습니다.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '질문 삭제에 실패했습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  @Patch(':id')
  async updateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body('answer') answer: string,
    @Query('secret') secret?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (secret !== '0000') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    await this.questionService.updateAnswer(id, answer);
    return { success: true, message: '답변이 저장되었습니다.' };
  }
}
