# Autenticação Local (Admin)

Este projeto foi atualizado para remover totalmente a dependência do Supabase e adotar um mecanismo de autenticação local, sem serviços externos.

## O que foi alterado

- Removida a dependência `@supabase/supabase-js` do `package.json`.
- Substituído `src/integrations/supabase/client.ts` por um stub local baseado em `localStorage`, mantendo a API mínima usada pela aplicação (`select`, `order`, `eq`, `single`, `insert`, `update`). Isso garante que as telas que listavam dados não quebrem mesmo sem backend.
- Implementado `src/services/localAuth.ts` com autenticação local usando as credenciais:
  - E-mail: `admin@rodotec.com.br`
  - Senha: `admin123`
- Atualizado `src/contexts/AdminAuthContext.tsx` para usar `localAuth` (login, logout e carregamento do usuário atual).
- Validação de formulário e mensagens de erro no `src/pages/admin/AdminLogin.tsx`.

## Como funciona a autenticação

- As credenciais são validadas localmente e NUNCA são armazenadas.
- É gerado um token aleatório (via `crypto.getRandomValues`) e o perfil mínimo do usuário é salvo em `localStorage` (`auth_token` e `auth_user`).
- O contexto (`AdminAuthContext`) lê o token em `localStorage` e inicializa o usuário, mantendo o fluxo de redirecionamento para `/admin` após login bem‑sucedido.

## Uso

1. Inicie o projeto: `npm run dev`
2. Acesse `/admin/login`
3. Entre com `admin@rodotec.com.br` e `admin123`
4. Você será redirecionado para `/admin`.

## Testes recomendados

Fluxos principais:
- Login com credenciais corretas: deve exibir toast de sucesso e redirecionar para `/admin`.
- Login com credenciais inválidas: deve exibir mensagens de erro claras.
- Redirecionamento pós-login: ao já estar autenticado, acessar `/admin/login` deve levar para `/admin`.

Validação de navegadores:
- Testar em Chrome, Firefox, Edge e Safari (se disponível).
- Verificar persistência do token ao recarregar a página.

Mensagens/UX:
- Campos `email` e `password` exigidos; validação de formato de e‑mail e tamanho mínimo de senha com toasts.

## Observação sobre dados

As páginas que antes consumiam dados do Supabase continuam funcionais com o stub local — elas exibem estados vazios ou manipulam dados em memória/localStorage. Quando houver backend próprio, substitua chamadas pelo módulo `src/services/api.ts` conforme os endpoints disponíveis.