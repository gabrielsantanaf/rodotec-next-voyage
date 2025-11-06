// Local authentication service without external dependencies
// Valid credentials: email admin@rodotec.com.br, password admin123

import type { AdminUser, LoginResponse } from '@/types/api';

const STORAGE_TOKEN_KEY = 'auth_token';
const STORAGE_USER_KEY = 'auth_user';

// Fixed admin user profile
const ADMIN_EMAIL = 'admin@rodotec.com.br';
const ADMIN_PASSWORD = 'admin123';

function generateToken(): string {
  // Simple random token; in real apps use HTTP-only cookies from backend
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function saveSession(user: AdminUser, token: string) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  // Do not store password; only minimal user profile
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

export const localAuth = {
  async login({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
    // Validate credentials locally
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Credenciais inválidas');
    }

    const user: AdminUser = {
      id: 'local-admin',
      name: 'Administrador',
      email: ADMIN_EMAIL,
      role: 'admin',
      created_at: new Date().toISOString(),
    } as AdminUser;

    const token = generateToken();
    saveSession(user, token);

    return { user, token };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  },

  async getCurrentUser(): Promise<AdminUser> {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const raw = localStorage.getItem(STORAGE_USER_KEY);

    if (!token || !raw) {
      throw new Error('Sessão não encontrada');
    }

    return JSON.parse(raw) as AdminUser;
  },
};

export default localAuth;