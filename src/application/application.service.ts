import { Injectable, HttpException, HttpStatus, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationEntity } from './entities/application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<ApplicationEntity> {
    try {
      // 기숙사 선택 시 호실 확인
      if (createApplicationDto.isDormitory && !createApplicationDto.room) {
        throw new BadRequestException(
          '기숙사 선택 시 호실을 입력해야 합니다.',
        );
      }

      // 기숙사를 선택하지 않으면 room 필드 제거
      if (!createApplicationDto.isDormitory) {
        createApplicationDto.room = undefined;
      }

      const application = this.applicationRepository.create(createApplicationDto);
      const savedApplication = await this.applicationRepository.save(application);

      return savedApplication;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errObj = error as Record<string, unknown>;
      if (typeof errObj.code === 'string' && errObj.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 등록된 이메일입니다.');
      }

      const message = error instanceof Error ? error.message : String(error);

      throw new HttpException(
        '지원서 저장 중 오류가 발생했습니다: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<ApplicationEntity[]> {
    try {
      return await this.applicationRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
    } catch {
      throw new HttpException(
        '지원서 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<ApplicationEntity> {
    try {
      // UUID 형식 검증
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('유효한 지원서 ID가 아닙니다.');
      }

      const application = await this.applicationRepository.findOne({
        where: { id },
      });

      if (!application) {
        throw new HttpException(
          '해당 ID의 지원서를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      return application;
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '지원서 조회 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // UUID 형식 검증
      if (!this.isValidUUID(id)) {
        throw new BadRequestException('유효한 지원서 ID가 아닙니다.');
      }

      const result = await this.applicationRepository.delete(id);

      if (result.affected === 0) {
        throw new HttpException(
          '해당 ID의 지원서를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '지원서 삭제 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}


