## Objetivo
Resolver erros da integração frontend↔backend, alinhar campos aos endpoints reais, e configurar o backend com .env e credenciais de admin (Login: admin@rodotec.com.br, Senha: admin123).

## Correções de Código (Frontend)
1. Orçamentos (Admin)
- Mapear campos do backend: usar `_id`, `createdAt`, `produto.nome`, remover coluna "Qtd" e referências a `quantidade/notasInternas/criadoEm` no modal.
- Atualizar handlers para `quotes.updateStatus` e `quotes.delete` e tratar erros com `toast` (já em parte implementado, ajustar UI restante).

2. Produtos (Admin)
- Editor: garantir `FormData` com campos do backend (`nome`, `descricao`, `preco`, `categoria`, `estoque`, `sku`, `especificacoes`, `imagens[]`) e enviar DataURL→Blob (já implementado; ajustar rótulos/validações conforme doc).
- Listagem: manter `api.products.list` e categorias via `api.categories.list` (já implementado).

3. Autenticação (Admin)
- `signOut` apenas limpa token/localStorage sem chamar endpoint inexistente.
- Exibir na tela de login um lembrete "Login: admin@rodotec.com.br | Senha: admin123".

## Configuração Backend (.env)
1. Criar `.env` na raiz de `backend-rodotec` com:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://mongo-rodotec:27017/products_db
JWT_SECRET=220235031bf74838a172a1b5982c56ca03503d2213e37f233dea42dcd13f2167d17725ec3d91d36d88c226534c82fc2d1f2bd926b011cae809bf495e8b4b65c7
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@rodotec.com.br
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
FRONTEND_URL=http://localhost:8080,http://localhost:3001,https://meusite.com
```
2. Ajustar CORS para aceitar lista de origens (`FRONTEND_URL`), fazendo split por vírgula.
3. Rodar script `scripts/createAdmin.js` (se existente) ou endpoint de registro admin para criar o usuário com essas credenciais.

## Testes
- Integração: fluxo admin login → criar produto (multipart) → listar → criar orçamento público → listar orçamentos → atualizar status.
- Regressão: garantir que páginas Orçamentos/Produtos/Configurações renderizam sem erros e com dados do backend.
- Carga: `/api/products` list e `/api/quotes` GET/POST; relatório de p95/p99.

## Documentação
- Instruções para criar `.env`, iniciar backend (npm/docker-compose), e configurar `VITE_API_BASE_URL` no frontend.
- Referência de endpoints usados com exemplos (link para `API_DOCUMENTATION.md`).

Confirma que devo aplicar essas correções de UI e configuração do backend, incluindo a mensagem de credenciais na página de login e o `.env` com os valores fornecidos?