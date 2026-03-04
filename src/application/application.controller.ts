import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationEntity } from './entities/application.entity';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @Query('secret') secret?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: ApplicationEntity;
  }> {
    if (secret !== '0000') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    try {
      const data = await this.applicationService.create(createApplicationDto);
      return {
        success: true,
        message: '지원서가 성공적으로 제출되었습니다.',
        data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '지원서 제출에 실패했습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }

  }

  @Get(':id')
  async getApplicationById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{
    success: boolean;
    data?: ApplicationEntity;
    message?: string;
  }> {
    try {
      const data = await this.applicationService.findOne(id);
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '지원서를 찾을 수 없습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  @Delete(':id')
  async deleteApplication(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('secret') secret?: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (secret !== '0000') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }
    try {
      await this.applicationService.remove(id);
      return {
        success: true,
        message: '지원서가 삭제되었습니다.',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '지원서 삭제에 실패했습니다.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}
