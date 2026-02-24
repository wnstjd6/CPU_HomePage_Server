import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
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
  ): Promise<{
    success: boolean;
    message: string;
    data?: ApplicationEntity;
  }> {
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

  @Get()
  async getAllApplications(): Promise<{
    success: boolean;
    data: ApplicationEntity[];
  }> {
    const data = await this.applicationService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string): Promise<{
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
  async deleteApplication(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
  }> {
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
