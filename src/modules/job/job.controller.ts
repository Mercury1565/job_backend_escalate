import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UserRole } from 'src/shared/enums/userRole';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobService.create(createJobDto, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  update(
    @Body() updateJobDto: UpdateJobDto,
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.jobService.update(id, updateJobDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  delete(@Request() req, @Param('id') id: string) {
    return this.jobService.delete(id, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.APPLICANT)
  findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('companyName') companyName?: string,
  ) {
    return this.jobService.findAll(
      req.user,
      page,
      pageSize,
      title,
      location,
      companyName,
    );
  }

  @Get('my-jobs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  findMyJobs(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.jobService.findMyJobs(req.user, page, pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }
}
