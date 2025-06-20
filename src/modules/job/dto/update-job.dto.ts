import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  @IsOptional()
  title?: string;

  @IsString()
  @Length(20, 2000, {
    message: 'Description must be between 20 and 2000 characters',
  })
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
