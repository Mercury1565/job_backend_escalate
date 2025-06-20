import { IsEnum } from 'class-validator';
import { ApplicationStatus } from 'src/shared/enums/applicationStatus';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
