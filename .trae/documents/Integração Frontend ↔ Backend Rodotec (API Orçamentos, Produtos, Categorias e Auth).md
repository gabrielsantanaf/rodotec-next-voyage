## Visão Geral
Integrar o frontend React/Tailwind com o backend existente em `backend-rodotec`, cobrindo autenticação, produtos, categorias e orçamentos, com tratamento de erros, segurança (CORS e JWT), testes de integração/carga e documentação.

## Alvos de Integração
- Base URL: `http://localhost:3000/api` (conforme `backend-rodotec/API_DOCUMENTATION.md`).
- Recursos:
  - Auth: `/auth/login`, `/auth/me`, `/auth/register`, `/auth/users*` (admin)
  - Categorias: `/categories*`
  - Produtos: `/products*` (multipart para criação/edição)
  - Orçamentos: `/quotes*` (admin; público para criação)

## Frontend: Camada de API e Serviços
1. Configuração
- Criar `src/api/config.ts`: `API_BASE_URL` (por env), `TIMEOUT_MS`, mapeamento de erros.
- Criar `src/api/http.ts`: wrapper de `fetch` com:
  - Headers padrão, `Authorization: Bearer <token>` quando presente
  - JSON/multipart conforme endpoint
  - Reintentos condicionais, cancelamento por AbortController
  - Mapeamento de respostas e erros (HTTP 4xx/5xx) com códigos do doc
2. Serviços
- `src/api/auth.ts`: `login`, `me`, `logout`, `register`, `listUsers`, `updateUser`, `deleteUser`
- `src/api/products.ts`: `list`, `get`, `create(formData)`, `update(id, formData)`, `delete`, `updateStock`, `deleteImage`
- `src/api/categories.ts`: `list`, `get`, `create(formData)`, `update`, `delete`, `deleteImage`
- `src/api/quotes.ts`: `createPublic`, `listAdmin`, `getAdmin`, `updateStatus`, `updateObservacoes`, `delete`, `stats`
3. Autenticação
- Atualizar `src/contexts/AdminAuthContext.tsx` para:
  - Fazer `login` via backend; salvar token em `localStorage`, chamar `me` para hidratar usuário
  - Refresh opcional (se o backend der suporte), senão revalidar em `me`
- `src/components/admin/ProtectedAdminRoute.tsx`: checar token + `me` e redirecionar para `/admin/login` se inválido

## Frontend: Páginas e Fluxos
1. Orçamentos (Admin)
- `AdminOrcamentos.tsx`:
  - Substituir `localDataLayer.getOrcamentos` por `quotes.listAdmin`
  - Atualizar `status` via `quotes.updateStatus`
  - Exibir detalhes via `quotes.getAdmin`
  - CSV export local mantido (ou endpoint dedicado opcional)
2. Produtos (Admin)
- `AdminProdutos.tsx`:
  - Listar com filtros usando `products.list` (query params: categoria, ativo, search, sort)
- `AdminProdutoEditor.tsx`:
  - Criar/editar com `multipart/form-data` via `products.create`/`products.update`
  - Upload de imagens do formulário; validações conforme doc (preço≥0, estoque≥0, sku único)
3. Categorias (Admin) [se aplicável na UI]
- CRUD usando `categories.*` com upload único de imagem
4. Público
- `src/pages/Produtos.tsx` e `src/pages/ProdutoDetalhe.tsx`:
  - Consumir `products.list` e `products.get`; remover dependência de repositório local
- Formulário público de orçamento: usar `quotes.createPublic`

## Backend: Segurança e Configuração
1. CORS
- Verificar `backend-rodotec/app.js`/`server.js` e `src/config/index.js`; habilitar CORS para origem do frontend (http://localhost:8080) com métodos `GET,POST,PUT,PATCH,DELETE` e headers `Content-Type, Authorization`
2. Auth
- JWT já documentado; assegurar `auth` middleware nas rotas admin (`src/middlewares/auth.js`)
3. Uploads
- Confirmar `src/middlewares/upload.js` e tamanho máximo; garantir destino `uploads/images` e servir estático

## Tratamento de Erros e Desempenho
- Mapear respostas padrão (sucesso/erro) do backend no wrapper HTTP
- Exibir toasts com mensagens claras; estados vazios/carregando nos grids
- Paginação e `limit`/`page` nos listadores para evitar cargas grandes
- Cache leve (React Query opcional) para listas

## Testes
1. Integração (frontend ↔ backend)
- Simular fluxo: login admin → criar produto (multipart) → listar produtos → criar orçamento público → listar orçamentos admin → atualizar status
- Ferramenta: Vitest + MSW para fallback, e testes e2e com Playwright apontando para `localhost:3000`
2. Regressão
- Manter snapshots das páginas críticas (Orçamentos, Produtos, Configurações) e validar interações existentes
3. Carga
- Artillery ou k6:
  - Carga em `/api/products` list (100 rps, 5 min)
  - Carga em `/api/quotes` (POST com rate limit respeitado) e `/api/quotes` (GET)
  - Reportar latência p95/p99 e erros

## Documentação
- Atualizar README do frontend:
  - Como configurar `.env` (`VITE_API_BASE_URL=http://localhost:3000/api`)
  - Como iniciar backend (`backend-rodotec/QUICK_START.md` ou `docker-compose.yml`)
  - Fluxos principais e uso de token
- Documentar serviços (`src/api/*`) e exemplos de requisição/resposta
- Mapear endpoints utilizados com links ao `backend-rodotec/API_DOCUMENTATION.md`

## Entrega e Rollout
- Feature flag: opção de manter fallback local (repositório/localDataLayer) para ambientes sem backend
- Checklist de QA: autenticação, CRUDs de produtos/categorias/orçamentos, upload, paginação e filtros
- Scripts de teste e relatórios anexados

Confirma que devo implementar essa integração (camada HTTP, serviços, atualização de páginas, testes e documentação)? Após sua confirmação, aplico as mudanças e valido com testes e navegação real.