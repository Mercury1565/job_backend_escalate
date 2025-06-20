import { IsString, Length, IsOptional } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title: string;

  @IsString()
  @Length(20, 2000, {
    message: 'Description must be between 20 and 2000 characters',
  })
  description: string;

  @IsString()
  @IsOptional()
  location?: string;
}
