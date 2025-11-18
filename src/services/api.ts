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
  CreateProductData,
  CreateQuoteData,
  AdminUser,
} from '@/types/api';

// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Classe para erros da API
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Array<{ field: string; message: string }>
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
      errorData.mensagem || errorData.message || 'Erro na requisição',
      response.status,
      errorData.errors
    );
  }

  // Parse seguro: evita erro em respostas 204/sem corpo
  const text = await response.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : ({} as T);
  } catch {
    return text as unknown as T;
  }
}

// Tipos para respostas do backend
interface BackendLoginResponse {
  usuario?: AdminUser;
  user?: AdminUser;
  token?: string;
}

interface BackendResponse<T> {
  sucesso?: boolean;
  success?: boolean;
  dados?: T;
  data?: T;
  [key: string]: unknown;
}

// Helper para extrair dados da resposta (suporta ambos formatos)
function extractData<T>(response: BackendResponse<T> | T): T {
  // Se já é do tipo T diretamente
  if (typeof response === 'object' && response !== null && !('dados' in response) && !('data' in response)) {
    return response as T;
  }

  const resp = response as BackendResponse<T>;
  // Backend retorna { sucesso: true, dados: {...} } ou { success: true, data: {...} }
  if (resp.dados !== undefined) {
    return resp.dados as T;
  }
  if (resp.data !== undefined) {
    return resp.data as T;
  }
  // Se não tem dados/data, retorna a resposta inteira (para casos como PaginatedResponse)
  return response as T;
}

// ============ AUTENTICAÇÃO ============

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const payload = { email: credentials.email, senha: credentials.password };
    const response = await fetchApi<BackendResponse<BackendLoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = extractData<BackendLoginResponse>(response);

    // Backend retorna { usuario: {...}, token: "..." }
    // Precisamos converter para { user: {...}, token: "..." }
    if (!data.usuario && !data.user) {
      throw new ApiError('Resposta de login inválida: usuário não encontrado');
    }
    if (!data.token) {
      throw new ApiError('Resposta de login inválida: token não encontrado');
    }

    const loginResponse: LoginResponse = {
      user: data.usuario || data.user!,
      token: data.token
    };

    // Salvar token no localStorage
    localStorage.setItem('auth_token', loginResponse.token);

    return loginResponse;
  },

  register: async (data: {
    email: string;
    senha: string;
    nome: string;
    role?: 'admin' | 'user';
  }): Promise<LoginResponse> => {
    const response = await fetchApi<BackendResponse<BackendLoginResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const responseData = extractData<BackendLoginResponse>(response);

    if (!responseData.usuario && !responseData.user) {
      throw new ApiError('Resposta de registro inválida: usuário não encontrado');
    }
    if (!responseData.token) {
      throw new ApiError('Resposta de registro inválida: token não encontrado');
    }

    const loginResponse: LoginResponse = {
      user: responseData.usuario || responseData.user!,
      token: responseData.token
    };

    localStorage.setItem('auth_token', loginResponse.token);

    return loginResponse;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await fetchApi<BackendResponse<AdminUser>>('/auth/me');
    const data = extractData<AdminUser | { usuario?: AdminUser }>(response);
    // Backend retorna usuario diretamente ou { usuario: {...} }
    if (typeof data === 'object' && data !== null && 'usuario' in data) {
      return (data as { usuario: AdminUser }).usuario;
    }
    return data as AdminUser;
  },

  updateProfile: async (data: {
    nome?: string;
    email?: string;
    senhaAtual?: string;
    novaSenha?: string;
  }): Promise<AdminUser> => {
    const response = await fetchApi<BackendResponse<AdminUser>>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return extractData<AdminUser>(response);
  },
};

// ============ DASHBOARD ============

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await fetchApi<BackendResponse<DashboardStats>>('/quotes/stats');
    return extractData<DashboardStats>(response);
  },

  getRecentQuotes: async (limit = 5): Promise<QuoteRequest[]> => {
    const response = await fetchApi<PaginatedResponse<QuoteRequest>>(
      `/quotes?limit=${limit}&sort=-createdAt`
    );
    return response.dados || [];
  },

  getRecentProducts: async (limit = 5): Promise<Product[]> => {
    const response = await fetchApi<PaginatedResponse<Product>>(
      `/products?limit=${limit}&sort=-createdAt`
    );
    return response.dados || [];
  },
};

// ============ PRODUTOS ============

export const productsApi = {
  list: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoria) params.append('categoria', filters.categoria);
    if (filters?.ativo !== undefined) params.append('ativo', String(filters.ativo));
    if (filters?.destaque !== undefined) params.append('destaque', String(filters.destaque));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<PaginatedResponse<Product> | { success: boolean; data: Product[]; pagination?: { total?: number; page?: number; pages?: number; limit?: number } }>(`/products${query}`);
    // Backend retorna { success: true, data: [...], pagination: {...} }
    // Precisamos normalizar para { dados: [...], paginacao: {...} }
    if ('success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
      const pagination = 'pagination' in response ? response.pagination : undefined;
      return {
        sucesso: true,
        dados: response.data,
        paginacao: pagination ? {
          total: pagination.total || 0,
          pagina: pagination.page || 1,
          limite: pagination.pages ? Math.ceil((pagination.total || 0) / pagination.pages) : pagination.limit || 10,
          paginas: pagination.pages || 1
        } : undefined
      } as PaginatedResponse<Product>;
    }
    // Se já está no formato correto
    return response as PaginatedResponse<Product>;
  },

  get: async (id: string): Promise<Product> => {
    const response = await fetchApi<BackendResponse<Product>>(`/products/${id}`);
    return extractData<Product>(response);
  },

  create: async (data: FormData | CreateProductData): Promise<Product> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetchApi<BackendResponse<Product>>('/products', {
      method: 'POST',
      body: isFD ? data : JSON.stringify(data),
    });

    return extractData<Product>(response);
  },

  update: async (id: string, data: FormData | Partial<Product>): Promise<Product> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetchApi<BackendResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: isFD ? data : JSON.stringify(data),
    });

    return extractData<Product>(response);
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/products/${id}`, { method: 'DELETE' });
  },

  updateStock: async (id: string, estoque: number): Promise<Product> => {
    const response = await fetchApi<BackendResponse<Product>>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ estoque }),
    });
    return extractData<Product>(response);
  },

  deleteImage: async (id: string, imageId: string): Promise<void> => {
    await fetchApi(`/products/${id}/images/${imageId}`, { method: 'DELETE' });
  },
};

// ============ ORÇAMENTOS ============

export const quotesApi = {
  list: async (filters?: QuoteFilters): Promise<PaginatedResponse<QuoteRequest>> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.produto) params.append('produto', filters.produto);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<PaginatedResponse<QuoteRequest> | { success: boolean; data: QuoteRequest[]; pagination?: { total?: number; page?: number; pages?: number; limit?: number } }>(`/quotes${query}`);
    // Backend retorna { sucesso: true, dados: [...], paginacao: {...} }
    // Já está no formato correto, mas vamos garantir
    if ('sucesso' in response && response.sucesso && 'dados' in response) {
      return response as PaginatedResponse<QuoteRequest>;
    }
    // Se retornou no formato alternativo
    if ('success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
      const pagination = 'pagination' in response ? response.pagination : undefined;
      return {
        sucesso: true,
        dados: response.data,
        paginacao: pagination ? {
          total: pagination.total || 0,
          pagina: pagination.page || 1,
          limite: pagination.limit || 10,
          paginas: pagination.pages || 1
        } : undefined
      } as PaginatedResponse<QuoteRequest>;
    }
    return response as PaginatedResponse<QuoteRequest>;
  },

  get: async (id: string): Promise<QuoteRequest> => {
    const response = await fetchApi<BackendResponse<QuoteRequest>>(`/quotes/${id}`);
    return extractData<QuoteRequest>(response);
  },

  create: async (data: CreateQuoteData): Promise<QuoteRequest> => {
    const response = await fetchApi<BackendResponse<QuoteRequest>>('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return extractData<QuoteRequest>(response);
  },

  createPublic: async (data: CreateQuoteData): Promise<QuoteRequest> => {
    // Mesma função, mas sem token (público)
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.mensagem || errorData.message || 'Erro na requisição',
        response.status,
        errorData.errors
      );
    }

    const result = await response.json() as BackendResponse<QuoteRequest>;
    return extractData<QuoteRequest>(result);
  },

  updateStatus: async (id: string, status: string): Promise<QuoteRequest> => {
    const response = await fetchApi<BackendResponse<QuoteRequest>>(`/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return extractData<QuoteRequest>(response);
  },

  updateObservacoes: async (id: string, observacoes: string): Promise<QuoteRequest> => {
    const response = await fetchApi<BackendResponse<QuoteRequest>>(`/quotes/${id}/observacoes`, {
      method: 'PATCH',
      body: JSON.stringify({ observacoes }),
    });
    return extractData<QuoteRequest>(response);
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/quotes/${id}`, { method: 'DELETE' });
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await fetchApi<BackendResponse<DashboardStats>>('/quotes/stats');
    return extractData<DashboardStats>(response);
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
  list: async (filters?: {
    page?: number;
    limit?: number;
    ativa?: boolean;
  }): Promise<PaginatedResponse<Category>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.ativa !== undefined) params.append('ativa', String(filters.ativa));

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<PaginatedResponse<Category> | { success: boolean; data: Category[]; pagination?: { total?: number; page?: number; pages?: number; limit?: number } }>(`/categories${query}`);
    // Backend retorna { success: true, data: [...], pagination: {...} }
    // Precisamos normalizar para { dados: [...], paginacao: {...} }
    if ('success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
      const pagination = 'pagination' in response ? response.pagination : undefined;
      return {
        sucesso: true,
        dados: response.data,
        paginacao: pagination ? {
          total: pagination.total || 0,
          pagina: pagination.page || 1,
          limite: pagination.pages ? Math.ceil((pagination.total || 0) / pagination.pages) : pagination.limit || 10,
          paginas: pagination.pages || 1
        } : undefined
      } as PaginatedResponse<Category>;
    }
    // Se já está no formato correto
    return response as PaginatedResponse<Category>;
  },

  get: async (id: string): Promise<Category> => {
    const response = await fetchApi<BackendResponse<Category>>(`/categories/${id}`);
    return extractData<Category>(response);
  },

  create: async (data: FormData | { nome: string; descricao?: string }): Promise<Category> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetchApi<BackendResponse<Category>>('/categories', {
      method: 'POST',
      body: isFD ? data : JSON.stringify(data),
    });

    return extractData<Category>(response);
  },

  update: async (id: string, data: FormData | Partial<Category>): Promise<Category> => {
    const isFD = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetchApi<BackendResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: isFD ? data : JSON.stringify(data),
    });

    return extractData<Category>(response);
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/categories/${id}`, { method: 'DELETE' });
  },

  deleteImage: async (id: string): Promise<void> => {
    await fetchApi(`/categories/${id}/image`, { method: 'DELETE' });
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

    const data = await response.json() as BackendResponse<{ url: string }>;
    return extractData<{ url: string }>(data);
  },

  delete: async (url: string): Promise<void> => {
    await fetchApi('/media', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
  },
};

// ============ HEALTH CHECK ============

export const healthApi = {
  check: async (): Promise<{ success: boolean; message: string; timestamp: string }> => {
    return await fetchApi('/health');
  },
};

export default {
  auth: authApi,
  dashboard: dashboardApi,
  products: productsApi,
  quotes: quotesApi,
  categories: categoriesApi,
  media: mediaApi,
  health: healthApi,
};
