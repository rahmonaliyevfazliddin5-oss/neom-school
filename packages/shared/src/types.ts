import { Role, AttendanceStatus, PostType, SubmissionStatus } from './enums';

export interface SafeUser {
  id: string;
  login: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthMeDto {
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  role: Role;
  redirectUrl: string;
  mustChangePassword: boolean;
}

export interface AcademicYearDto {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isCurrent: boolean;
}

export interface ClassDto {
  id: string;
  grade: number;
  letter: string;
  academicYearId: string;
  homeroomTeacherId?: string | null;
  homeroomTeacher?: SafeUser | null;
  studentCount?: number;
}

export interface StudentDto {
  id: string;
  fullName: string;
  classId: string;
  isActive: boolean;
  createdAt: Date | string;
}

export interface AttendanceRecordDto {
  id: string;
  studentId: string;
  studentName?: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  markedById: string;
}

export interface AttendanceSummaryDto {
  date: string;
  classId?: string;
  totalStudents: number;
  keldi: number;
  kelmadi: number;
  sababli: number;
  kechikdi: number;
  submissionStatus?: SubmissionStatus;
}

export interface PostDto {
  id: string;
  type: PostType;
  title: string;
  body: string;
  eventDate?: Date | string | null;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdById: string;
  createdBy?: SafeUser | null;
  updatedAt: Date | string;
}

export interface AuditLogDto {
  id: string;
  userId?: string | null;
  action: string;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: Date | string;
}

export interface SiteStatsDto {
  teachers: number | null;
  students: number | null;
  classrooms: number | null;
  graduatesRate: number | null;
}

export interface SiteSettingsResponseDto {
  stats: SiteStatsDto;
  address: string | null;
  phone: string | null;
  workHours: string | null;
}

export interface PublicPostListItemDto {
  id: string;
  type: PostType;
  title: string;
  excerpt: string;
  eventDate?: Date | string | null;
  thumbUrl?: string | null;
  publishedAt: Date | string;
}

export interface PublicPostDetailDto {
  id: string;
  type: PostType;
  title: string;
  body: string;
  eventDate?: Date | string | null;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  publishedAt: Date | string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: unknown;
}
