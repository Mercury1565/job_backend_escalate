import { IsString, IsEmail, IsEnum, Matches } from 'class-validator';
import { UserRole } from 'src/shared/enums/userRole';

export class CreateUserDto {
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name must contain only alphabets' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @IsEnum(UserRole, { message: 'Role must be either applicant or company' })
  role: UserRole;
}
