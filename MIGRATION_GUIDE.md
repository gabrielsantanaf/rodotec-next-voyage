# Guia de Migração: Supabase → API Própria

Este guia mostra como migrar os arquivos restantes do Supabase para a nova API centralizada.

## ✅ Arquivos Já Migrados

- ✅ `src/contexts/AdminAuthContext.tsx`
- ✅ `src/components/admin/ProtectedAdminRoute.tsx`
- ✅ `src/pages/admin/AdminDashboard.tsx`
- ✅ Criado `src/services/api.ts` (serviço centralizado)
- ✅ Criado `src/types/api.ts` (tipos TypeScript)

## ⏳ Arquivos Para Migrar

Os seguintes arquivos ainda precisam ser atualizados:

### 1. `src/pages/admin/AdminProdutos.tsx`

**ANTES:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('...')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    setProducts(data || []);
  }
};
```

**DEPOIS:**
```typescript
import { productsApi } from '@/services/api';
import type { Product } from '@/types/api';

const loadProducts = async () => {
  try {
    const response = await productsApi.list({ search });
    setProducts(response.data);
  } catch (error) {
    console.error('Error loading products:', error);
  }
};
```

### 2. `src/pages/admin/AdminProdutoEditor.tsx`

**ANTES:**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Carregar
const loadProduct = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
};

// Salvar
const handleSave = async () => {
  if (isEditing) {
    await supabase.from('products').update(formData).eq('id', id);
  } else {
    await supabase.from('products').insert([formData]);
  }
};
```

**DEPOIS:**
```typescript
import { productsApi, categoriesApi } from '@/services/api';
import type { Product } from '@/types/api';

// Carregar
const loadProduct = async () => {
  try {
    const data = await productsApi.get(id);
    setFormData(data);
  } catch (error) {
    console.error('Error loading product:', error);
    toast.error('Erro ao carregar produto');
    navigate('/admin/produtos');
  }
};

// Salvar
const handleSave = async () => {
  try {
    if (isEditing) {
      await productsApi.update(id, formData);
      toast.success('Produto atualizado com sucesso');
    } else {
      const product = await productsApi.create(formData);
      toast.success('Produto criado com sucesso');
      navigate(`/admin/produtos/${product.id}`);
    }
  } catch (error: any) {
    toast.error(error.message || 'Erro ao salvar produto');
  }
};

// Carregar categorias
const loadCategories = async () => {
  try {
    const data = await categoriesApi.list();
    setCategories(data);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};
```

### 3. `src/pages/admin/AdminOrcamentos.tsx`

**ANTES:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const loadQuotes = async () => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    setQuotes(data || []);
  }
};
```

**DEPOIS:**
```typescript
import { quotesApi } from '@/services/api';
import type { QuoteRequest } from '@/types/api';

const loadQuotes = async () => {
  try {
    const response = await quotesApi.list({
      search,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    });
    setQuotes(response.data);
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
};
```

### 4. `src/pages/admin/AdminOrcamentoDetalhe.tsx`

**ANTES:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const loadQuote = async () => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();
};

const handleSave = async () => {
  const { error } = await supabase
    .from('quote_requests')
    .update({ status, assignee, notes })
    .eq('id', id);
};
```

**DEPOIS:**
```typescript
import { quotesApi } from '@/services/api';
import type { QuoteRequest } from '@/types/api';

const loadQuote = async () => {
  try {
    const data = await quotesApi.get(id);
    setQuote(data);
    setStatus(data.status);
    setAssignee(data.assignee || '');
    setNotes(data.notes || '');
  } catch (error) {
    console.error('Error loading quote:', error);
    toast.error('Erro ao carregar orçamento');
    navigate('/admin/orcamentos');
  }
};

const handleSave = async () => {
  try {
    await quotesApi.update(id, { status, assignee, notes });
    toast.success('Orçamento atualizado com sucesso');
    loadQuote(); // Recarregar dados
  } catch (error: any) {
    toast.error(error.message || 'Erro ao salvar orçamento');
  }
};
```

### 5. `src/pages/Contato.tsx`

**ANTES:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const { error } = await supabase
      .from('quote_requests')
      .insert([{ ...formData }]);

    if (error) throw error;
    toast.success('Solicitação enviada!');
  } catch (error: any) {
    toast.error('Erro ao enviar solicitação');
  }
};
```

**DEPOIS:**
```typescript
import { quotesApi } from '@/services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await quotesApi.create({
      name: formData.name,
      company: formData.company || null,
      email: formData.email,
      phone: formData.phone,
      product_name: formData.productName,
      message: formData.message,
      consent_lgpd: formData.consentLGPD,
    });

    toast.success('Solicitação enviada com sucesso!');

    // Reset form
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      productName: 'Outro',
      message: '',
      consentLGPD: false,
    });
  } catch (error: any) {
    console.error('Error submitting quote request:', error);
    toast.error('Erro ao enviar solicitação');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Padrão de Migração

Para cada arquivo, siga este padrão:

### 1. Remover Import do Supabase

```diff
- import { supabase } from '@/integrations/supabase/client';
```

### 2. Adicionar Imports da Nova API

```diff
+ import { productsApi, quotesApi, categoriesApi } from '@/services/api';
+ import type { Product, QuoteRequest, Category } from '@/types/api';
```

### 3. Substituir Queries Supabase

**Select:**
```diff
- const { data, error } = await supabase.from('table').select('*');
- if (error) { /* handle */ }
+ const data = await api.method();
```

**Insert:**
```diff
- const { data, error } = await supabase.from('table').insert([item]);
+ const data = await api.create(item);
```

**Update:**
```diff
- const { error } = await supabase.from('table').update(data).eq('id', id);
+ await api.update(id, data);
```

**Delete:**
```diff
- const { error } = await supabase.from('table').delete().eq('id', id);
+ await api.delete(id);
```

### 4. Tratamento de Erros

Agora use try/catch ao invés de verificar `error`:

```typescript
try {
  const data = await api.method();
  // sucesso
} catch (error: any) {
  console.error('Error:', error);
  toast.error(error.message || 'Erro na operação');
}
```

---

## Script de Migração Automática

Você pode usar este script para ajudar na migração:

```bash
#!/bin/bash

# Buscar todos os arquivos que usam supabase
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "supabase" "$file"; then
    echo "⚠️  Arquivo precisa migração: $file"
  fi
done
```

---

## Checklist de Migração

Para cada arquivo:

- [ ] Remover import do Supabase
- [ ] Adicionar imports da API
- [ ] Substituir queries select
- [ ] Substituir queries insert
- [ ] Substituir queries update
- [ ] Substituir queries delete
- [ ] Atualizar tratamento de erros
- [ ] Atualizar tipos TypeScript
- [ ] Testar funcionalidade
- [ ] Verificar console por erros

---

## Testar Após Migração

1. **Configurar URL da API:**
   ```bash
   cp .env.example .env
   # Editar .env e definir VITE_API_BASE_URL
   ```

2. **Build do projeto:**
   ```bash
   npm run build
   ```

3. **Testar cada funcionalidade:**
   - Login/Logout
   - Dashboard (KPIs e listas)
   - Listar produtos
   - Criar/Editar produto
   - Listar orçamentos
   - Ver detalhes do orçamento
   - Formulário público de contato

4. **Verificar console do navegador:**
   - Não deve haver erros de Supabase
   - Todas as requisições devem ir para sua API

---

## Suporte

- Consulte `API_DOCUMENTATION.md` para especificação completa da API
- Veja `src/services/api.ts` para exemplos de uso
- Todos os tipos estão em `src/types/api.ts`

---

## Exemplo Completo: Migrar AdminProdutos.tsx

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '@/services/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Product } from '@/types/api';

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      const response = await productsApi.list({ search });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* ... resto do componente ... */}
    </AdminLayout>
  );
}
```

Pronto! Agora é só replicar esse padrão para os demais arquivos.
