import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from '../dtos/auth.dto';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request<unknown, AuthResponseDto, RegisterRequestDto>, res: Response<AuthResponseDto>) => {
   console.log('Register payload:', JSON.stringify(req.body, null, 2)); // 👈

  const result = await AuthService.register(req.body);
  console.log(`User registered: ${result}`);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request<unknown, AuthResponseDto, LoginRequestDto>, res: Response<AuthResponseDto>) => {
  const result = await AuthService.login(req.body);
  res.status(200).json(result);
});
