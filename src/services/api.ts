import type {
  LoginRequest,
  LoginResponse,
  Product,
  QuoteRequest,
  Category,
  DashboardStats,
  ProductFilters,
  QuoteFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';
import { supabase } from '@/integrations/supabase/client';

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Classe para erros da API
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper para fazer requisições
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    ...options.headers,
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Erro na requisição',
      response.status,
      errorData.errors
    );
  }

  // Parse seguro: evita erro em respostas 204/sem corpo
  const text = await response.text().catch(() => '');
  try {
    return (text ? JSON.parse(text) : ({} as T));
  } catch {
    // Se não for JSON, retorna texto bruto
    return (text as unknown as T);
  }
}

// ============ AUTENTICAÇÃO ============

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const payload = { email: credentials.email, senha: credentials.password };
    const response = await fetchApi<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Salvar token no localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  getCurrentUser: async () => {
    const response = await fetchApi<ApiResponse<LoginResponse['user']>>('/auth/me');
    return response.data;
  },
};

// ============ DASHBOARD ============

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetchApi<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Fallback: calcular estatísticas locais via stub
      console.warn('API indisponível, usando dados locais para stats:', error);
      const { data: products } = await supabase.from('products').select('status');
      const { data: quotes } = await supabase.from('quote_requests').select('status');
      const stats: DashboardStats = {
        new_quotes: (quotes || []).filter((q: any) => q.status === 'NEW').length,
        in_progress_quotes: (quotes || []).filter((q: any) => q.status === 'IN_PROGRESS').length,
        completed_quotes: (quotes || []).filter((q: any) => q.status === 'WON' || q.status === 'LOST').length,
        active_products: (products || []).filter((p: any) => p.status === 'ACTIVE').length,
        draft_products: (products || []).filter((p: any) => p.status === 'DRAFT').length,
      };
      return stats;
    }
  },

  getRecentQuotes: async (limit = 5) => {
    try {
      const response = await fetchApi<ApiResponse<QuoteRequest[]>>(
        `/dashboard/recent-quotes?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando dados locais para recent-quotes:', error);
      const { data } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []).slice(0, limit);
    }
  },

  getRecentProducts: async (limit = 5) => {
    try {
      const response = await fetchApi<ApiResponse<Product[]>>(
        `/dashboard/recent-products?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando dados locais para recent-products:', error);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false });
      return (data || []).slice(0, limit);
    }
  },
};

// ============ PRODUTOS ============

export const productsApi = {
  list: async (filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    try {
      const response = await fetchApi<PaginatedResponse<Product>>(`/products${query}`);
      return response;
    } catch (error) {
      console.warn('API indisponível, usando dados locais para listagem de produtos:', error);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false });

      const filtered = (data || []).filter((p: any) => {
        const search = filters?.search?.toLowerCase();
        if (!search) return true;
        return (
          (p.title || '').toLowerCase().includes(search) ||
          (p.sku || '').toLowerCase().includes(search)
        );
      });

      return {
        data: filtered,
        meta: {
          current_page: 1,
          per_page: filtered.length,
          total: filtered.length,
          total_pages: 1,
        },
      };
    }
  },

  get: async (id: string): Promise<Product> => {
    try {
      const response = await fetchApi<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando dados locais para obter produto:', error);
      const { data, error: supaErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (supaErr) throw new ApiError(supaErr.message);
      return data as Product;
    }
  },

  create: async (data: FormData | Partial<Product>): Promise<Product> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;
    try {
      const response = await fetchApi<ApiResponse<Product>>('/products', {
        method: 'POST',
        body: isFD ? (data as FormData) : JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando stub local para criar produto:', error);
      const insertRes = await supabase.from('products').insert([data as Partial<Product>]);
      if (insertRes.error) throw new ApiError(insertRes.error.message);
      const created = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data;
      return created as Product;
    }
  },

  update: async (id: string, data: FormData | Partial<Product>): Promise<Product> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;
    try {
      const response = await fetchApi<ApiResponse<Product>>(`/products/${id}`, {
        method: 'PUT',
        body: isFD ? (data as FormData) : JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando stub local para atualizar produto:', error);
      const updateRes = await supabase.from('products').update(data as Partial<Product>).eq('id', id);
      if (updateRes.error) throw new ApiError(updateRes.error.message);
      const { data: updated, error: supaErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (supaErr) throw new ApiError(supaErr.message);
      return updated as Product;
    }
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/products/${id}`, { method: 'DELETE' });
  },
};

// ============ ORÇAMENTOS ============

export const quotesApi = {
  list: async (filters?: QuoteFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<PaginatedResponse<QuoteRequest>>(`/quotes${query}`);
    return response;
  },

  get: async (id: string): Promise<QuoteRequest> => {
    const response = await fetchApi<ApiResponse<QuoteRequest>>(`/quotes/${id}`);
    return response.data;
  },

  create: async (data: Partial<QuoteRequest>): Promise<QuoteRequest> => {
    const response = await fetchApi<ApiResponse<QuoteRequest>>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<QuoteRequest>): Promise<QuoteRequest> => {
    const response = await fetchApi<ApiResponse<QuoteRequest>>(`/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<QuoteRequest> => {
    const response = await fetchApi<ApiResponse<QuoteRequest>>(`/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  updateObservacoes: async (id: string, observacoes: string): Promise<QuoteRequest> => {
    const response = await fetchApi<ApiResponse<QuoteRequest>>(`/quotes/${id}/observacoes`, {
      method: 'PATCH',
      body: JSON.stringify({ observacoes }),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/quotes/${id}`, { method: 'DELETE' });
  },

  createPublic: async (data: {
    nome: string;
    email: string;
    telefone: string;
    produto: string; // MongoID do produto
    mensagem?: string;
    consent_lgpd?: boolean;
  }): Promise<QuoteRequest> => {
    const payload: any = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      produto: data.produto,
      mensagem: data.mensagem,
    };
    const response = await fetchApi<any>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    // Backend usa { sucesso, dados }
    return (response.data || response.dados) as QuoteRequest;
  },

  exportCSV: async (filters?: QuoteFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/quotes/export${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new ApiError('Erro ao exportar CSV', response.status);
    }

    return response.blob();
  },
};

// ============ CATEGORIAS ============

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    try {
      const response = await fetchApi<ApiResponse<Category[]>>('/categories');
      return response.data;
    } catch (error) {
      console.warn('API indisponível, usando stub local para categorias:', error);
      const { data, error: supaErr } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (supaErr) throw new ApiError(supaErr.message);
      return (data || []) as Category[];
    }
  },

  get: async (id: string): Promise<Category> => {
    const response = await fetchApi<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await fetchApi<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await fetchApi<ApiResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/categories/${id}`, { method: 'DELETE' });
  },
};

// ============ UPLOAD DE MÍDIA ============

export const mediaApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError('Erro ao fazer upload', response.status);
    }

    const data = await response.json();
    return data.data;
  },

  delete: async (url: string): Promise<void> => {
    await fetchApi('/media', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
  },
};

export default {
  auth: authApi,
  dashboard: dashboardApi,
  products: productsApi,
  quotes: quotesApi,
  categories: categoriesApi,
  media: mediaApi,
};
