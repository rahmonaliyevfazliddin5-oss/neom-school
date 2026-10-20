import { z } from 'zod';
import { Role, AttendanceStatus, PostType, SubmissionStatus } from './enums';

export const LoginSchema = z.object({
  login: z
    .string()
    .min(3, "Login kamida 3 ta belgidan iborat bo'lishi kerak")
    .max(50)
    .trim(),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    .max(100),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ChangeCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, 'Joriy parol kiritilishi shart'),
    newLogin: z.string().min(3).max(50).trim().optional(),
    newPassword: z
      .string()
      .min(10, "Yangi parol kamida 10 ta belgidan iborat bo'lishi kerak")
      .regex(/[A-Z]/, 'Parolda kamida bitta katta harf bo‘lishi kerak')
      .regex(/[a-z]/, 'Parolda kamida bitta kichik harf bo‘lishi kerak')
      .regex(/[0-9]/, 'Parolda kamida bitta raqam bo‘lishi kerak'),
    confirmPassword: z.string().min(10, 'Yangi parolni takrorlang'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Yangi parollar bir-biriga mos kelmadi',
    path: ['confirmPassword'],
  });

export type ChangeCredentialsInput = z.infer<typeof ChangeCredentialsSchema>;

export const CreateClassSchema = z.object({
  grade: z.number().int().min(1).max(11),
  letter: z
    .string()
    .length(1, "Harf bitta belgidan iborat bo'lishi kerak")
    .toUpperCase(),
  academicYearId: z.string().uuid(),
  homeroomTeacherId: z.string().uuid().nullable().optional(),
});

export type CreateClassInput = z.infer<typeof CreateClassSchema>;

export const CreateStudentSchema = z.object({
  fullName: z.string().min(3).max(120),
  classId: z.string().uuid(),
  isActive: z.boolean().default(true),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export const MarkAttendanceItemSchema = z.object({
  studentId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus),
  note: z.string().max(255).optional(),
});

export const BulkAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana YYYY-MM-DD formatida bo'lishi kerak"),
  records: z.array(MarkAttendanceItemSchema),
});

export type BulkAttendanceInput = z.infer<typeof BulkAttendanceSchema>;

export const SubmitAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana YYYY-MM-DD formatida bo'lishi kerak"),
});

export type SubmitAttendanceInput = z.infer<typeof SubmitAttendanceSchema>;

export const CreatePostSchema = z.object({
  type: z.nativeEnum(PostType),
  title: z.string().min(3).max(255),
  body: z.string().min(5),
  eventDate: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const PublicPostsQuerySchema = z.object({
  type: z.nativeEnum(PostType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(6),
});

export type PublicPostsQueryInput = z.infer<typeof PublicPostsQuerySchema>;

