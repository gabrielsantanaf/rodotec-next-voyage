# Documentação da API - RODOTEC Admin

Este documento especifica todos os endpoints que seu backend deve implementar para funcionar com o frontend do admin.

## Configuração

O frontend espera que a URL base da API seja configurada via variável de ambiente:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Autenticação

Todos os endpoints (exceto login e criação pública de orçamento) requerem autenticação via Bearer Token no header:

```
Authorization: Bearer {token}
```

O token é armazenado no `localStorage` após o login bem-sucedido.

---

## Endpoints da API

### 🔐 Autenticação

#### POST /auth/login
Fazer login e obter token.

**Request:**
```json
{
  "email": "admin@rodotec.com.br",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin RODOTEC",
      "email": "admin@rodotec.com.br",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGc..."
  }
}
```

#### POST /auth/logout
Fazer logout (invalida o token).

**Request:** (apenas header Authorization)

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### GET /auth/me
Obter dados do usuário autenticado.

**Request:** (apenas header Authorization)

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Admin RODOTEC",
    "email": "admin@rodotec.com.br",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 📊 Dashboard

#### GET /dashboard/stats
Obter estatísticas do dashboard.

**Response (200):**
```json
{
  "data": {
    "new_quotes": 5,
    "in_progress_quotes": 3,
    "completed_quotes": 12,
    "active_products": 25,
    "draft_products": 8
  }
}
```

#### GET /dashboard/recent-quotes?limit=5
Obter últimos orçamentos.

**Query Params:**
- `limit` (opcional): número de itens (padrão: 5)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "company": "Empresa XYZ",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999",
      "product_id": "uuid",
      "product_name": "Carroceria Baú",
      "message": "Gostaria de um orçamento",
      "consent_lgpd": true,
      "status": "NEW",
      "assignee": null,
      "notes": null,
      "source": "SITE_FORM",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /dashboard/recent-products?limit=5
Obter últimos produtos atualizados.

**Query Params:**
- `limit` (opcional): número de itens (padrão: 5)

**Response (200):** (mesmo formato de GET /products)

---

### 📦 Produtos

#### GET /products
Listar produtos com filtros e paginação.

**Query Params:**
- `search` (opcional): busca por título ou SKU
- `status` (opcional): `ACTIVE` ou `DRAFT`
- `category_id` (opcional): UUID da categoria
- `page` (opcional): número da página (padrão: 1)
- `per_page` (opcional): itens por página (padrão: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Carroceria Baú 8m",
      "slug": "carroceria-bau-8m",
      "description": "Descrição do produto",
      "status": "ACTIVE",
      "price": 85000.00,
      "sku": "CBF-8M-001",
      "barcode": "1234567890",
      "stock_qty": 5,
      "allow_backorder": false,
      "weight_kg": 1200.00,
      "dimensions_l": 800,
      "dimensions_a": 240,
      "dimensions_p": 280,
      "country_of_origin": "Brasil",
      "hs_code": "8716.39.00",
      "type": "Carroceria Frigorífica",
      "manufacturer": "RODOTEC",
      "media": [
        {
          "url": "https://example.com/image.jpg",
          "alt": "Carroceria Baú",
          "type": "image",
          "order": 0
        }
      ],
      "category_id": "uuid",
      "seo_title": "Carroceria Baú 8m - RODOTEC",
      "seo_description": "Descrição SEO",
      "tags": ["frigorifico", "bau"],
      "published": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

#### GET /products/:id
Obter um produto específico.

**Response (200):**
```json
{
  "data": { ... } // mesmo formato do objeto de produto acima
}
```

#### POST /products
Criar novo produto.

**Request:**
```json
{
  "title": "Carroceria Baú 8m",
  "description": "Descrição",
  "status": "DRAFT",
  "price": 85000.00,
  "sku": "CBF-8M-001",
  // ... outros campos
}
```

**Response (201):**
```json
{
  "data": { ... } // produto criado
}
```

#### PUT /products/:id
Atualizar produto.

**Request:** (mesmos campos do POST, todos opcionais)

**Response (200):**
```json
{
  "data": { ... } // produto atualizado
}
```

#### DELETE /products/:id
Deletar produto.

**Response (204):** (sem conteúdo)

---

### 💼 Orçamentos

#### GET /quotes
Listar orçamentos com filtros.

**Query Params:**
- `search` (opcional): busca por nome, empresa, email ou telefone
- `status` (opcional): `NEW`, `IN_PROGRESS`, `CONTACTED`, `WON`, `LOST`
- `page` (opcional): número da página
- `per_page` (opcional): itens por página

**Response (200):** (formato igual ao de produtos com paginação)

#### GET /quotes/:id
Obter um orçamento específico.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "company": "Empresa XYZ",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "product_id": "uuid",
    "product_name": "Carroceria Baú",
    "message": "Gostaria de um orçamento",
    "consent_lgpd": true,
    "status": "NEW",
    "assignee": "Carlos Mendes",
    "notes": "Cliente interessado em financiamento",
    "source": "SITE_FORM",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /quotes (PÚBLICO - SEM AUTENTICAÇÃO)
Criar novo orçamento (usado pelo formulário público).

**Request:**
```json
{
  "name": "João Silva",
  "company": "Empresa XYZ",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "product_name": "Carroceria Baú",
  "product_id": "uuid", // opcional
  "message": "Gostaria de um orçamento",
  "consent_lgpd": true
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    // ... dados do orçamento criado
  }
}
```

#### PATCH /quotes/:id
Atualizar orçamento (status, assignee, notes).

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "assignee": "Carlos Mendes",
  "notes": "Cliente interessado em financiamento"
}
```

**Response (200):**
```json
{
  "data": { ... } // orçamento atualizado
}
```

#### GET /quotes/export
Exportar orçamentos como CSV.

**Query Params:** (mesmos filtros do GET /quotes)

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="orcamentos.csv"

Status,Nome,Empresa,Produto,Telefone,Email,Data
...
```

---

### 🗂️ Categorias

#### GET /categories
Listar todas as categorias.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Carrocerias",
      "slug": "carrocerias",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /categories/:id
Obter uma categoria.

#### POST /categories
Criar categoria.

#### PUT /categories/:id
Atualizar categoria.

#### DELETE /categories/:id
Deletar categoria.

---

### 📷 Upload de Mídia

#### POST /media/upload
Fazer upload de arquivo (imagem ou vídeo).

**Request:**
```
Content-Type: multipart/form-data

file: [arquivo binário]
```

**Response (200):**
```json
{
  "data": {
    "url": "https://cdn.example.com/uploads/image.jpg"
  }
}
```

#### DELETE /media
Deletar arquivo.

**Request:**
```json
{
  "url": "https://cdn.example.com/uploads/image.jpg"
}
```

**Response (204):** (sem conteúdo)

---

## Tratamento de Erros

Todos os erros devem retornar o seguinte formato:

**Response (4xx/5xx):**
```json
{
  "message": "Mensagem de erro legível",
  "errors": {
    "campo": ["erro específico do campo"]
  }
}
```

### Códigos de Status

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (erro de validação)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `422` - Unprocessable Entity (erro de validação)
- `500` - Internal Server Error

---

## Tipos TypeScript de Referência

Os tipos completos estão em `src/types/api.ts`.

### Status Válidos

```typescript
ProductStatus = 'ACTIVE' | 'DRAFT'
QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'WON' | 'LOST'
AdminRole = 'admin' | 'editor'
```

---

## Segurança

1. **CORS**: Permitir origem do frontend
2. **Rate Limiting**: Implementar limite de requisições
3. **Validação**: Validar todos os inputs
4. **SQL Injection**: Usar queries parametrizadas
5. **XSS**: Sanitizar HTML/JavaScript em campos de texto
6. **Token**: JWT com expiração (recomendado 24h)
7. **Senhas**: Hash com bcrypt (mínimo 10 rounds)

---

## Exemplo de Implementação (Node.js/Express)

```javascript
// Exemplo de endpoint de login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Responder
    res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});
```

---

## Testando a API

Use o arquivo `.env.example` para configurar a URL da API:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Teste cada endpoint com ferramentas como:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code)

---

## Suporte

Para dúvidas sobre a integração frontend-backend, consulte:
- `src/services/api.ts` - Implementação das chamadas
- `src/types/api.ts` - Tipos TypeScript
- Este documento - Especificação completa
