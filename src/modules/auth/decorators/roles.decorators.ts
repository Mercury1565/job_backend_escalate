import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/shared/enums/userRole';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
