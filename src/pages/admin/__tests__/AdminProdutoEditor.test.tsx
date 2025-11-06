import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminProdutoEditor from '../AdminProdutoEditor';

// Mock toast
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// Mock Select UI to avoid Radix validation errors in test environment
vi.mock('@/components/ui/select', () => {
  const PassThrough = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Item = ({ children, value = 'item', ...props }: any) => (
    <div data-value={value} {...props}>{children}</div>
  );
  return {
    Select: PassThrough,
    SelectGroup: PassThrough,
    SelectValue: PassThrough,
    SelectTrigger: PassThrough,
    SelectContent: PassThrough,
    SelectLabel: PassThrough,
    SelectItem: Item,
    SelectSeparator: PassThrough,
    SelectScrollUpButton: PassThrough,
    SelectScrollDownButton: PassThrough,
  };
});

// Mock API client with functions created inside the factory to avoid hoisting issues
vi.mock('@/services/api', () => {
  const create = vi.fn().mockResolvedValue({ id: 'p1' });
  const update = vi.fn().mockResolvedValue(undefined);
  const list = vi.fn().mockResolvedValue([{ id: 'cat1', name: 'Categoria 1' }]);
  const get = vi.fn().mockResolvedValue({
    id: 'p1', title: 'Produto', slug: 'produto', description: 'desc', status: 'ACTIVE',
    price: 10, sku: '', barcode: '', stock_qty: 1, allow_backorder: false,
    weight_kg: null, dimensions_l: null, dimensions_a: null, dimensions_p: null,
    country_of_origin: '', hs_code: '', type: '', manufacturer: '', media: [],
    category_id: null, seo_title: '', seo_description: '', tags: [], published: true,
  });
  return {
    productsApi: { create, update, get },
    categoriesApi: { list },
  };
});

describe('AdminProdutoEditor', () => {
  beforeEach(() => {
    // Clear mocked API functions
    const reset = async () => {
      const { productsApi, categoriesApi } = await import('@/services/api');
      (productsApi.create as any).mockClear?.();
      (productsApi.update as any).mockClear?.();
      (productsApi.get as any).mockClear?.();
      (categoriesApi.list as any).mockClear?.();
    };
    // Vitest doesn't support async beforeEach in this file context without returning a promise
    // so we trigger a microtask to clear if functions exist
    reset();
  });

  it('renders and validates required fields before save', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/produtos/novo' }] }>
        <AdminAuthProvider>
          <AdminProdutoEditor />
        </AdminAuthProvider>
      </MemoryRouter>
    );

    const saveButton = await screen.findByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Should not call API create when fields invalid
    const { productsApi } = await import('@/services/api');
    expect(productsApi.create).not.toHaveBeenCalled();
  });
});