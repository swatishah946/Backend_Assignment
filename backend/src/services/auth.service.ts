import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/customErrors.js';
import { Role, User } from '@prisma/client';

export interface SanitizedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResponse {
  user: SanitizedUser;
  token: string;
}

export class AuthService {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    
    // Check if this is the very first user in the system. If so, make them an ADMIN.
    // This is a common and extremely helpful feature to allow testing without manual database manipulation!
    const userCount = await userRepository.count();
    const role: Role = userCount === 0 ? 'ADMIN' : 'USER';

    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
      role,
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getMe(id: string): Promise<SanitizedUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
