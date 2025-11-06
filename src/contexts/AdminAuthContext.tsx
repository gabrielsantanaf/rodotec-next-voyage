import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import type { AdminUser, AdminRole } from '@/types/api';

interface AdminAuthContextType {
  user: AdminUser | null;
  role: AdminRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: AdminRole) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se existe token e carregar usuário
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        setRole(currentUser.role);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      setRole(response.user.role);
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: { message: error.message || 'Erro ao fazer login' } };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setRole(null);
      navigate('/admin/login');
    }
  };

  const hasRole = (requiredRole: AdminRole) => {
    if (!role) return false;
    if (requiredRole === 'editor') return role === 'admin' || role === 'editor';
    return role === requiredRole;
  };

  return (
    <AdminAuthContext.Provider value={{ user, role, loading, signIn, signOut, hasRole }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
