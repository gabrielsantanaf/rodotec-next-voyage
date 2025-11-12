# RODOTEC - Dados Locais

Este sistema usa `localStorage` para persistência de dados **offline**.

## Credenciais de Login

- **E-mail**: `admin@rodotec.com.br`
- **Senha**: `admin123`

## Estrutura de Dados

Todos os dados são armazenados em `localStorage` com as seguintes chaves:
- `rodotec:products` - Produtos
- `rodotec:quote_requests` - Orçamentos
- `rodotec:download_assets` - Downloads
- `rodotec:news_posts` - Novidades
- `rodotec:distributors` - Distribuidores
- `rodotec:categories` - Categorias

## Funcionalidades Admin

1. **Exportar Dados**: Baixa todos os dados em JSON
2. **Importar Dados**: Restaura dados de um arquivo JSON
3. **Resetar Dados**: Limpa tudo e recarrega dados de exemplo

## Desenvolvimento

Para acessar o Admin:
1. Acesse `/admin/login`
2. Use as credenciais acima
3. Navegue pelas seções do painel

Os dados são persistidos automaticamente no navegador.
