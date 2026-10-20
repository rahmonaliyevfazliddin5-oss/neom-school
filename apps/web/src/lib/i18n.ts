import uzMessages from '../../messages/uz.json';
import guestMessages from '../../messages/guest.json';

export type TranslationKey = string;

export function getDictionary() {
  return uzMessages;
}

export function getGuestDictionary() {
  return guestMessages;
}

export function t(path: string): string {
  const parts = path.split('.');
  let current: any = uzMessages;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function tGuest(path: string): any {
  const parts = path.split('.');
  let current: any = guestMessages;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return current !== undefined ? current : path;
}
