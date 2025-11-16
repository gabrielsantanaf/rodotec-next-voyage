import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProdutoDetalhe from '../ProdutoDetalhe'

vi.mock('@/services/api', () => {
  const products = {
    list: vi.fn().mockResolvedValue({ data: [{ _id: 'pid123', nome: 'Produto Teste', sku: 'SKU-1', imagensUrls: [] }] }),
  }
  const quotes = {
    createPublic: vi.fn().mockResolvedValue({ _id: 'q1' })
  }
  return { default: { products, quotes } }
})

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('ProdutoDetalhe orçamento', () => {
  it('valida mensagem mínima antes de enviar', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/produtos/produto-teste' }]}>
        <Routes>
          <Route path="/produtos/:slug" element={<ProdutoDetalhe />} />
        </Routes>
      </MemoryRouter>
    )

    const nome = await screen.findByLabelText(/nome/i)
    const email = screen.getByLabelText(/e-mail/i)
    const telefone = screen.getByLabelText(/telefone/i)
    const mensagem = screen.getByLabelText(/mensagem/i)
    const enviar = screen.getByRole('button', { name: /enviar/i })

    await userEvent.type(nome, 'Cliente Teste')
    await userEvent.type(email, 'cliente@teste.com')
    await userEvent.type(telefone, '11999999999')
    await userEvent.type(mensagem, 'curta')

    await userEvent.click(enviar)

    const api = (await import('@/services/api')).default
    expect(api.quotes.createPublic).not.toHaveBeenCalled()
  })

  it('envia orçamento com dados válidos', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/produtos/produto-teste' }]}>
        <Routes>
          <Route path="/produtos/:slug" element={<ProdutoDetalhe />} />
        </Routes>
      </MemoryRouter>
    )

    const nome = await screen.findByLabelText(/nome/i)
    const email = screen.getByLabelText(/e-mail/i)
    const telefone = screen.getByLabelText(/telefone/i)
    const mensagem = screen.getByLabelText(/mensagem/i)
    const enviar = screen.getByRole('button', { name: /enviar/i })

    await userEvent.clear(nome); await userEvent.type(nome, 'Cliente Teste')
    await userEvent.clear(email); await userEvent.type(email, 'cliente@teste.com')
    await userEvent.clear(telefone); await userEvent.type(telefone, '11999999999')
    await userEvent.clear(mensagem); await userEvent.type(mensagem, 'Mensagem válida para orçamento')

    await userEvent.click(enviar)

    const api = (await import('@/services/api')).default
    expect(api.quotes.createPublic).toHaveBeenCalled()
    const call = (api.quotes.createPublic as any).mock.calls[0][0]
    expect(call.nome).toBe('Cliente Teste')
    expect(call.produto).toBe('pid123')
  })
})