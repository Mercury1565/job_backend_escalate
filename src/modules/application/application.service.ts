import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/entities/application.entity';
import { Job } from 'src/entities/job.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/shared/enums/userRole';
import { ApplicationStatus } from 'src/shared/enums/applicationStatus';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    user: User,
    file: Express.Multer.File,
  ) {
    if (user.role !== UserRole.APPLICANT) {
      throw new UnauthorizedException('Only applicants can apply for jobs');
    }

    const { jobId, coverLetter } = createApplicationDto;
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new BadRequestException('Job not found');
    }

    const existingApplication = await this.applicationRepository.findOne({
      where: { applicant: { id: user.id }, job: { id: jobId } },
    });
    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    if (coverLetter && coverLetter.length > 200) {
      throw new BadRequestException(
        'Cover letter must be under 200 characters',
      );
    }

    const uploadResult = await this.cloudinaryService.uploadFile(file);
    const application = this.applicationRepository.create({
      applicant: user,
      job,
      resumeLink: uploadResult.secure_url,
      coverLetter,
      status: ApplicationStatus.APPLIED,
    });
    await this.applicationRepository.save(application);
    return {
      success: true,
      message: 'Application submitted successfully',
      object: application,
      errors: null,
    };
  }

  async findMyApplications(
    user: User,
    page: number = 1,
    pageSize: number = 10,
  ) {
    if (user.role !== UserRole.APPLICANT) {
      throw new UnauthorizedException(
        'Only applicants can view their applications',
      );
    }

    const [applications, total] = await this.applicationRepository.findAndCount(
      {
        where: { applicant: { id: user.id } },
        relations: ['job', 'job.createdBy'],
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    );

    const formattedApplications = applications.map((app) => ({
      jobTitle: app.job.title,
      companyName: app.job.createdBy.name,
      status: app.status,
      appliedAt: app.appliedAt,
    }));

    return {
      success: true,
      message: 'Applications retrieved successfully',
      object: formattedApplications,
      pageNumber: page,
      pageSize,
      totalSize: total,
      errors: null,
    };
  }

  async findJobApplications(
    jobId: string,
    user: User,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, createdBy: { id: user.id } },
    });
    if (!job) {
      return {
        success: false,
        message: 'Unauthorized access or job not found',
        object: null,
        errors: ['Job not found or you do not have permission'],
      };
    }

    const [applications, total] = await this.applicationRepository.findAndCount(
      {
        where: { job: { id: jobId } },
        relations: ['applicant'],
        take: pageSize,
        skip: (page - 1) * pageSize,
      },
    );

    const formattedApplications = applications.map((app) => ({
      applicantName: app.applicant.name,
      resumeLink: app.resumeLink,
      coverLetter: app.coverLetter,
      status: app.status,
      appliedAt: app.appliedAt,
    }));

    return {
      success: true,
      message: 'Applications retrieved successfully',
      object: formattedApplications,
      pageNumber: page,
      pageSize,
      totalSize: total,
      errors: null,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
    user: User,
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.createdBy'],
    });
    if (!application) {
      return {
        success: false,
        message: 'Application not found',
        object: null,
        errors: ['Application not found'],
      };
    }
    if (application.job.createdBy.id !== user.id) {
      return {
        success: false,
        message: 'Unauthorized access',
        object: null,
        errors: ['You do not have permission to update this application'],
      };
    }

    const { status } = updateStatusDto;
    if (!Object.values(ApplicationStatus).includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    await this.applicationRepository.update(id, { status });
    const updatedApplication = await this.applicationRepository.findOne({
      where: { id },
    });
    return {
      success: true,
      message: 'Application status updated successfully',
      object: updatedApplication,
      errors: null,
    };
  }
}
