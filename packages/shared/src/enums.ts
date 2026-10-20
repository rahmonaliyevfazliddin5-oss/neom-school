export enum Role {
  TEACHER = 'TEACHER',
  ZAVUCH = 'ZAVUCH',
  DIRECTOR = 'DIRECTOR',
}

export enum AttendanceStatus {
  KELDI = 'KELDI',
  KELMADI = 'KELMADI',
  SABABLI = 'SABABLI',
  KECHIKDI = 'KECHIKDI',
}

export enum PostType {
  NEWS = 'NEWS',
  EVENT = 'EVENT',
  PLAN = 'PLAN',
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.TEACHER]: "O'qituvchi",
  [Role.ZAVUCH]: 'Zavuch',
  [Role.DIRECTOR]: 'Direktor',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.KELDI]: 'Keldi',
  [AttendanceStatus.KELMADI]: 'Kelmadi',
  [AttendanceStatus.SABABLI]: 'Sababli',
  [AttendanceStatus.KECHIKDI]: 'Kechikdi',
};

export const POST_TYPE_LABELS: Record<PostType, string> = {
  [PostType.NEWS]: 'Yangilik',
  [PostType.EVENT]: 'Tadbir',
  [PostType.PLAN]: 'Reja',
};
