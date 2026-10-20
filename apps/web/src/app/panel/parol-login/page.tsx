import { cookies } from 'next/headers';
import { Role } from '@neom/shared';
import PasswordAndLoginClient from './PasswordAndLoginClient';

function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default async function PasswordAndLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('neom_access_token')?.value;

  let initialRole = Role.DIRECTOR;
  if (token) {
    const payload = parseJwtPayload(token);
    if (payload?.role && Object.values(Role).includes(payload.role)) {
      initialRole = payload.role as Role;
    }
  }

  return <PasswordAndLoginClient initialRole={initialRole} />;
}
