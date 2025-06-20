import { IsString, IsUUID, Length, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  jobId: string;

  @IsString()
  @Length(0, 200)
  @IsOptional()
  coverLetter?: string;
}
