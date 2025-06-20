import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'User not found',
        object: null,
        errors: ['User not found'],
      });
    }

    const bcryptCompare = await bcrypt.compare(password, user.password);
    if (!bcryptCompare) {
      throw new UnauthorizedException({
        success: false,
        message: 'Incorrect password',
        object: null,
        errors: ['Incorrect password'],
      });
    }

    const payload = { sub: user.id, role: user.role };
    return {
      success: true,
      message: 'Login successful',
      object: { access_token: this.jwtService.sign(payload) },
      errors: null,
    };
  }
}
