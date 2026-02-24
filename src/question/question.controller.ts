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
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionEntity } from './entities/question.entity';

@Controller('question')
export class QuestionController {
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
  async getAllQuestions(): Promise<{
    success: boolean;
    data: QuestionEntity[];
  }> {
    const data = await this.questionService.findAll();
    return {
      success: true,
      data,
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
  async deleteQuestion(@Param('id', ParseIntPipe) id: number): Promise<{
    success: boolean;
    message: string;
  }> {
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
}
