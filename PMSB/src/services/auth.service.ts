import bcrypt from 'bcrypt';
import { models, sequelize } from '../config/database';
import type { RegisterRequestDto, LoginRequestDto } from '../dtos/auth.dto';
import { AppError } from '../utils/app-error';
import { signAuthToken } from '../utils/jwt';
import { UserRole } from '../models/user.model';

const { User, Employee } = models;

export class AuthService {
  static async register(payload: RegisterRequestDto) {
    const usernameTrimmed = payload.username.trim();
    const { password } = payload;

    // Check if username already exists
    const existingUser = await User.findOne({
      where: { username: usernameTrimmed },
    });

    if (existingUser) {
      throw new AppError(409, 'Username already in use');
    }

    // Use managed transaction: auto-commits on success, auto-rolls back on error
    return await sequelize.transaction(async (transaction) => {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create(
        {
          username: usernameTrimmed,
          password: hashedPassword,
          role: UserRole.Employee,
        },
        { transaction },
      );

      // Create associated Employee record
      await Employee.create(
        {
          userId: user.id,
          managerId: null,
          firstName: usernameTrimmed,
          lastName: 'User',
          department: null,
          position: null,
        },
        { transaction },
      );

      // Generate JWT token
      const token = signAuthToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      return { token };
    });
  }

  static async login(payload: LoginRequestDto) {
    const usernameTrimmed = payload.username.trim();
    const { password } = payload;

    const user = await User.scope('withPassword').findOne({ where: { username: usernameTrimmed } });
    if (!user || !user.password) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = signAuthToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return { token };
  }
}