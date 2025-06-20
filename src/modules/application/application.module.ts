import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { Application } from 'src/entities/application.entity';
import { Job } from 'src/entities/job.entity';
import { User } from 'src/entities/user.entity';
import { ApplicationController } from './application.controller';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Job, User])],
  providers: [ApplicationService, CloudinaryService],
  controllers: [ApplicationController],
  exports: [ApplicationService],
})
export class ApplicationModule {}
