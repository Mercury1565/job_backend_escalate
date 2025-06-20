import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/entities/job.entity';
import { User } from 'src/entities/user.entity';
import { Repository, Like } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UserRole } from 'src/shared/enums/userRole';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto, user: User) {
    if (user.role !== UserRole.COMPANY) {
      throw new UnauthorizedException('Only companies can create jobs');
    }

    const { title, description, location } = createJobDto;

    const job = this.jobRepository.create({
      title,
      description,
      location,
      createdBy: user,
    });
    await this.jobRepository.save(job);
    return {
      success: true,
      message: 'Job created successfully',
      object: job,
      errors: null,
    };
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: User) {
    const job = await this.jobRepository.findOne({
      where: { id, createdBy: { id: user.id } },
    });

    if (!job) {
      return {
        success: false,
        message: 'Unauthorized access or job not found',
        object: null,
        errors: ['Job not found or you do not have permission'],
      };
    }

    const { title, description, location } = updateJobDto;

    await this.jobRepository.update(id, { title, description, location });
    const updatedJob = await this.jobRepository.findOne({ where: { id } });

    return {
      success: true,
      message: 'Job updated successfully',
      object: updatedJob,
      errors: null,
    };
  }

  async delete(id: string, user: User) {
    const job = await this.jobRepository.findOne({
      where: { id, createdBy: { id: user.id } },
    });
    if (!job) {
      return {
        success: false,
        message: 'Unauthorized access or job not found',
        object: null,
        errors: ['Job not found or you do not have permission'],
      };
    }

    await this.jobRepository.delete(id);
    return {
      success: true,
      message: 'Job deleted successfully',
      object: null,
      errors: null,
    };
  }

  async findAll(
    user: User,
    page: number = 1,
    pageSize: number = 10,
    title?: string,
    location?: string,
    companyName?: string,
  ) {
    if (user.role !== UserRole.APPLICANT) {
      throw new UnauthorizedException('Only applicants can browse jobs');
    }

    // const where: any = {};
    // if (title) where.title = Like(`%${title}%`);
    // if (location) where.location = Like(`%${location}%`);
    // if (companyName) where.createdBy = { name: Like(`%${companyName}%`) };

    const [jobs, total] = await this.jobRepository.findAndCount({
      //   where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      relations: ['createdBy'],
    });

    return {
      success: true,
      message: 'Jobs retrieved successfully',
      object: jobs,
      pageNumber: page,
      pageSize,
      totalSize: total,
      errors: null,
    };
  }

  async findMyJobs(user: User, page: number = 1, pageSize: number = 10) {
    if (user.role !== UserRole.COMPANY) {
      throw new UnauthorizedException('Only companies can view their jobs');
    }

    const [jobs, total] = await this.jobRepository.findAndCount({
      where: { createdBy: { id: user.id } },
      take: pageSize,
      skip: (page - 1) * pageSize,
      relations: ['createdBy'],
    });

    return {
      success: true,
      message: 'Jobs retrieved successfully',
      object: jobs.map((job) => ({
        ...job,
        applicationCount: 0, // Add logic for application count if needed
      })),
      pageNumber: page,
      pageSize,
      totalSize: total,
      errors: null,
    };
  }

  async findOne(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!job) {
      return {
        success: false,
        message: 'Job not found',
        object: null,
        errors: ['Job not found'],
      };
    }
    return {
      success: true,
      message: 'Job retrieved successfully',
      object: job,
      errors: null,
    };
  }
}
