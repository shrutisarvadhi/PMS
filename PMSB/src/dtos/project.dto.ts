import { ProjectStatus } from '../models/project.model';

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  pmId?: string | null;
  status?: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  pmId?: string | null;
  status?: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  pmId: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
}
