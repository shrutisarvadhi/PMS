import type { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers = asyncHandler(async (_req: Request, res: Response<UserResponseDto[]>) => {
  const users = await UserService.list();
  res.json(users);
});

export const getUserById = asyncHandler(async (req: Request<{ id: string }>, res: Response<UserResponseDto>) => {
  const user = await UserService.findById(req.params.id);
  res.json(user);
});

export const createUser = asyncHandler(async (req: Request<unknown, UserResponseDto, CreateUserDto>, res: Response<UserResponseDto>) => {
  const user = await UserService.create(req.body);
  res.status(201).json(user);
});

export const updateUser = asyncHandler(async (req: Request<{ id: string }, UserResponseDto, UpdateUserDto>, res: Response<UserResponseDto>) => {
  const user = await UserService.update(req.params.id, req.body);
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  await UserService.remove(req.params.id);
  res.status(204).send();
});
