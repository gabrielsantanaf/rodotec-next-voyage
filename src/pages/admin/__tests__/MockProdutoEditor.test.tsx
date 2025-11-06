import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MockProdutoEditor from '../MockProdutoEditor';

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

describe('MockProdutoEditor (public sandbox)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderEditor = () => {
    return render(
      <MemoryRouter initialEntries={["/sandbox/produtos/novo"]}>
        <Routes>
          <Route path="/sandbox/produtos/novo" element={<MockProdutoEditor />} />
          <Route path="/produtos" element={<div>Produtos</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('preenche campos, valida e salva sem chamar back-end', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, 'fetch');
    renderEditor();

    await user.type(screen.getByLabelText(/título/i), 'Produto Mock');
    await user.type(screen.getByLabelText(/descrição/i), 'Descrição local');
    await user.type(screen.getByLabelText(/preço/i), '123');
    await user.type(screen.getByLabelText(/estoque/i), '5');

    // Salvar
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Não deve chamar fetch
    expect(fetchSpy).not.toHaveBeenCalled();

    // Deve persistir em localStorage
    const raw = localStorage.getItem('mock_products');
    expect(raw).toBeTruthy();
    const list = JSON.parse(String(raw));
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].title).toBe('Produto Mock');
  });

  it('Cancelar limpa rascunho e não chama back-end', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, 'fetch');
    renderEditor();

    await user.type(screen.getByLabelText(/título/i), 'Produto Mock');
    expect(localStorage.getItem('mock_product_draft')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('mock_product_draft')).toBeNull();
  });
});