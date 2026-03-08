import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionEntity } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionEntity> {
    try {
      if (!createQuestionDto.question) {
        throw new BadRequestException('질문은 필수 입력 필드입니다.');
      }

      const question = this.questionRepository.create(createQuestionDto);
      const savedQuestion = await this.questionRepository.save(question);

      return savedQuestion;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);

      throw new HttpException(
        '질문 저장 중 오류가 발생했습니다: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAnswer(id: number, answer: string): Promise<void> {
    if (typeof answer !== 'string' || answer.trim() === '') {
      throw new BadRequestException('답변 내용이 비어있거나 올바르지 않습니다.');
    }
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new HttpException('질문을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    if (question.answer === answer) {
      // 변경 사항이 없으면 바로 반환
      return;
    }
    question.answer = answer;
    try {
      await this.questionRepository.save(question);
    } catch (error) {
      throw new HttpException('답변 저장 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    page = 1,
    limit = 50,
  ): Promise<{ items: QuestionEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [items, total] = await this.questionRepository.findAndCount({
        skip,
        take: limit,
        order: {
          id: 'DESC',
        },
      });

      return { items, total };
    } catch {
      throw new HttpException(
        '질문 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<QuestionEntity> {
    try {
      const question = await this.questionRepository.findOne({
        where: { id },
      });

      if (!question) {
        throw new HttpException(
          '해당 ID의 질문을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      return question;
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new HttpException(
        '질문 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.questionRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException(
          '해당 ID의 질문을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new HttpException(
        '질문 삭제 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
