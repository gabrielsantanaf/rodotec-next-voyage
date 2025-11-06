// Tipos para as entidades da API

export type ProductStatus = 'ACTIVE' | 'DRAFT';
export type QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'WON' | 'LOST';
export type AdminRole = 'admin' | 'editor';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: ProductStatus;
  price: number | null;
  sku: string;
  barcode: string;
  stock_qty: number;
  allow_backorder: boolean;
  weight_kg: number | null;
  dimensions_l: number | null;
  dimensions_a: number | null;
  dimensions_p: number | null;
  country_of_origin: string;
  hs_code: string;
  type: string;
  manufacturer: string;
  media: MediaItem[];
  category_id: string | null;
  seo_title: string;
  seo_description: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  url: string;
  alt: string;
  type: 'image' | 'video';
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  product_id: string | null;
  product_name: string;
  message: string | null;
  consent_lgpd: boolean;
  status: QuoteStatus;
  assignee: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface DashboardStats {
  new_quotes: number;
  in_progress_quotes: number;
  completed_quotes: number;
  active_products: number;
  draft_products: number;
}

export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  category_id?: string;
  page?: number;
  per_page?: number;
}

export interface QuoteFilters {
  search?: string;
  status?: QuoteStatus;
  page?: number;
  per_page?: number;
}
