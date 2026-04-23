import { createHash, randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return hash === verifyHash;
}

export function validateCollegeEmail(email: string): boolean {
  return email.endsWith('@rknec.edu');
}

export function getSessionUser(): User | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('user_session');
  return session ? JSON.parse(session) : null;
}

export function setSessionUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_session', JSON.stringify(user));
}

export function clearSessionUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user_session');
}
