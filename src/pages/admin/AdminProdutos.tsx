import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Product, Category } from '@/types/api';

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
    loadCategories();
  }, []);

  useEffect(() => {
    const createdId = (location.state as any)?.createdId;
    if (createdId) {
      const created = products.find((p) => p._id === createdId);
      if (created) {
        import('sonner').then(({ toast }) => toast.success('Produto criado com sucesso'));
      }
    }
  }, [location.state, products]);

  const loadProducts = async () => {
    try {
      const res = await api.products.list({ limit: 1000 });
      setProducts(res.dados || []);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.categories.list({ limit: 100 });
      setCategories(res.dados || []);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
      setCategories([]);
    }
  };

  const handleDeleteProduct = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      return;
    }

    try {
      await api.products.delete(id);
      toast.success('Produto excluído com sucesso');
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast.error(error?.message || 'Erro ao excluir produto');
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) => p.nome.toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s)
      );
    }
    if (categoryId && categoryId !== 'all') {
      list = list.filter((p) => p.categoria?._id === categoryId);
    }
    if (status && status !== 'all') {
      list = list.filter((p) => (p.ativo ? 'ativo' : 'inativo') === status);
    }
    if (availability) {
      list = list.filter((p) => (p.estoque || 0) > 0);
    }
    switch (sort) {
      case 'name_asc':
        list.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'created_asc':
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'created_desc':
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }
    return list;
  }, [products, search, categoryId, status, availability, sort]);

  const perPage = view === 'grid' ? 12 : 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
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
                    <SelectItem key={c._id} value={c._id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
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
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  onClick={() => setView('list')}
                >
                  Lista
                </Button>
                <Button
                  variant={view === 'grid' ? 'default' : 'outline'}
                  onClick={() => setView('grid')}
                >
                  Grid
                </Button>
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
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableRow
                      key={product._id}
                      className={createdId === product._id ? 'ring-2 ring-brand' : ''}
                    >
                      <TableCell>
                        <Link
                          to={`/admin/produtos/${product._id}`}
                          className="font-medium hover:underline"
                        >
                          {product.nome}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.ativo ? 'default' : 'secondary'}>
                          {product.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || '—'}</TableCell>
                      <TableCell>{product.estoque}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(product.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/produtos/${product._id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id, product.nome)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                  <Card
                    key={product._id}
                    className={createdId === product._id ? 'ring-2 ring-brand' : ''}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video w-full bg-muted overflow-hidden">
                        {(() => {
                          const imgUrl = typeof product.imagemPrincipal === 'string' 
                            ? product.imagemPrincipal 
                            : product.imagemPrincipal?.url || 
                              (product.imagensUrls?.[0] 
                                ? (typeof product.imagensUrls[0] === 'string' 
                                  ? product.imagensUrls[0] 
                                  : product.imagensUrls[0].url || product.imagensUrls[0])
                                : null);
                          return imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              Sem imagem
                            </div>
                          );
                        })()}
                      </div>
                      <div className="p-4 space-y-2">
                        <Link
                          to={`/admin/produtos/${product._id}`}
                          className="font-medium hover:underline"
                        >
                          {product.nome}
                        </Link>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.ativo ? 'default' : 'secondary'}>
                            {product.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(product.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <Link to={`/admin/produtos/${product._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id, product.nome)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.max(1, currentPage - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages })
                  .slice(0, 5)
                  .map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(Math.min(totalPages, currentPage + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
