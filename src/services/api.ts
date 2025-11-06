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
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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

  return response.json();
}

// ============ AUTENTICAÇÃO ============

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetchApi<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
    const response = await fetchApi<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  getRecentQuotes: async (limit = 5) => {
    const response = await fetchApi<ApiResponse<QuoteRequest[]>>(
      `/dashboard/recent-quotes?limit=${limit}`
    );
    return response.data;
  },

  getRecentProducts: async (limit = 5) => {
    const response = await fetchApi<ApiResponse<Product[]>>(
      `/dashboard/recent-products?limit=${limit}`
    );
    return response.data;
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
    const response = await fetchApi<PaginatedResponse<Product>>(`/products${query}`);
    return response;
  },

  get: async (id: string): Promise<Product> => {
    const response = await fetchApi<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await fetchApi<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await fetchApi<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
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
    const response = await fetchApi<ApiResponse<Category[]>>('/categories');
    return response.data;
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
