import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from 'src/shared/enums/userRole';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPLICANT)
  @UseInterceptors(FileInterceptor('resume'))
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationService.create(createApplicationDto, req.user, file);
  }

  @Get('my-applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPLICANT)
  findMyApplications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.applicationService.findMyApplications(req.user, page, pageSize);
  }

  @Get('job/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  findJobApplications(
    @Param('jobId') jobId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.applicationService.findJobApplications(
      jobId,
      req.user,
      page,
      pageSize,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    return this.applicationService.updateStatus(id, updateStatusDto, req.user);
  }
}
