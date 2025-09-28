import { createZodDto } from 'nestjs-zod';
import { Role } from '../entities/user.entity';
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'username is required'),
  password: z.string().min(5, 'password is required'),
  role: z.enum(Role, 'role should be USER or ADMIN'),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
