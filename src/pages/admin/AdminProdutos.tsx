import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Product, Category } from '@/data/types';

export default function AdminProdutos() {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [categoryId, setCategoryId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [availability, setAvailability] = useState<boolean>(false);
  const [sort, setSort] = useState<string>('created_desc');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    loadProducts();
    api.categories.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const createdId = (location.state as any)?.createdId;
    if (createdId) {
      const created = products.find(p => p.id === createdId);
      if (created) {
        // Exibe feedback e reseta state para evitar repetição
        import('sonner').then(({ toast }) => toast.success('Produto criado com sucesso'));
      }
    }
  }, [location.state, products]);

  const loadProducts = async () => {
    try {
      const res = await api.products.list();
      setProducts(res.data as Product[]);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s)
      );
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter((p) => p.category_id === categoryId);
    }
    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status);
    }
    if (availability) {
      list = list.filter((p) => (p.stock_qty || 0) > 0);
    }
    switch (sort) {
      case 'name_asc':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'created_asc':
        list.sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
      case 'created_desc':
      default:
        list.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
    }
    return list;
  }, [products, search, categoryId, status, availability, sort]);

  const perPage = view === 'grid' ? 12 : 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);
  const createdId = (location.state as any)?.createdId as string | undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          <Link to="/admin/produtos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar produto
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-border">
          <div className="p-4 border-b border-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
                <span className="text-sm text-muted-foreground">Em estoque</span>
                <Switch checked={availability} onCheckedChange={setAvailability} />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Mais recentes</SelectItem>
                  <SelectItem value="created_asc">Mais antigos</SelectItem>
                  <SelectItem value="name_asc">Nome (A→Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-end gap-2">
                <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>Lista</Button>
                <Button variant={view === 'grid' ? 'default' : 'outline'} onClick={() => setView('grid')}>Grid</Button>
              </div>
            </div>
          </div>

          {view === 'list' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : pagedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                pagedProducts.map((product) => (
                  <TableRow key={product.id} className={createdId === product.id ? 'ring-2 ring-brand' : ''}>
                    <TableCell>
                      <Link
                        to={`/admin/produtos/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {product.status === 'ACTIVE' ? 'Ativo' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku || '—'}</TableCell>
                    <TableCell>{product.stock_qty}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(product.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : pagedProducts.length === 0 ? (
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              ) : (
                pagedProducts.map((product) => (
                  <Card key={product.id} className={createdId === product.id ? 'ring-2 ring-brand' : ''}>
                    <CardContent className="p-0">
                      <div className="aspect-video w-full bg-muted overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <Link to={`/admin/produtos/${product.id}`} className="font-medium hover:underline">{product.title}</Link>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {product.status === 'ACTIVE' ? 'Ativo' : 'Rascunho'}
                          </Badge>
                          
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(product.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, currentPage - 1)); }} />
                </PaginationItem>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); setPage(p); }} />
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, currentPage + 1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
