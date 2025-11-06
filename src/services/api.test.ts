import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// productsApi will be imported dynamically after mocks where needed

describe('services/api', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it('handles 204 No Content responses without throwing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
    });

    // Call delete which should accept 204
    const { productsApi } = await import('./api');
    await expect(productsApi.delete('123')).resolves.toBeUndefined();
  });

  it('falls back to local stub when backend unreachable on create', async () => {
    // Simulate backend down
    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    // Mock supabase stub
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: { from: () => ({ insert: () => Promise.resolve({ data: [{ id: 'abc123', title: 't' }] }) }) },
    }));

    const { productsApi } = await import('./api');
    const created = await productsApi.create({ title: 't' } as any);
    expect(created).toBeDefined();
    expect(created.id).toBe('abc123');
  });
});