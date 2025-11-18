import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DashboardStats, QuoteRequest, Product } from '@/types/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    novos: 0,
    emContato: 0,
    concluidos: 0,
    active_products: 0,
    draft_products: 0,
  });

  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carrega estatísticas de orçamentos
      const statsData = await api.quotes.getStats();
      
      // Buscar contagem de produtos ativos e inativos
      const [activeProductsRes, inactiveProductsRes] = await Promise.all([
        api.products.list({ ativo: true, limit: 1 }).catch(() => ({ dados: [] })),
        api.products.list({ ativo: false, limit: 1 }).catch(() => ({ dados: [] })),
      ]);

      // Backend retorna { total, novos, emContato, concluidos, ultimoMes, taxaConclusao, ... }
      setStats({
        novos: statsData.novos || 0,
        emContato: statsData.emContato || 0,
        concluidos: statsData.concluidos || 0,
        active_products: activeProductsRes.paginacao?.total || activeProductsRes.dados?.length || 0,
        draft_products: inactiveProductsRes.paginacao?.total || inactiveProductsRes.dados?.length || 0,
        taxaConclusao: statsData.taxaConclusao,
      });

      // Carrega orçamentos recentes
      const quotesData = await api.dashboard.getRecentQuotes(5);
      setRecentQuotes(quotesData || []);

      // Carrega produtos recentes
      const productsData = await api.dashboard.getRecentProducts(5);
      setRecentProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      novo: { label: 'Novo', variant: 'default' },
      em_contato: { label: 'Em contato', variant: 'secondary' },
      concluido: { label: 'Concluído', variant: 'outline' },
    };
    const config = variants[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos Novos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.novos || 0}</div>
              <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emContato || 0}</div>
              <p className="text-xs text-muted-foreground">Orçamentos em negociação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.concluidos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.taxaConclusao ? `${stats.taxaConclusao}% de taxa` : 'Total concluídos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_products || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draft_products || 0} rascunhos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Orçamentos Recentes</CardTitle>
              <Link to="/admin/orcamentos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : recentQuotes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotes.map((quote) => (
                    <TableRow key={quote._id}>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>
                        <Link to={`/admin/orcamentos/${quote._id}`} className="hover:underline">
                          {quote.nome}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.empresa || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {typeof quote.produto === 'object' ? quote.produto.nome : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(quote.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produtos Atualizados Recentemente</CardTitle>
              <Link to="/admin/produtos">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : recentProducts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum produto encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Link to={`/admin/produtos/${product._id}`} className="hover:underline">
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
                        {product.updatedAt
                          ? formatDistanceToNow(new Date(product.updatedAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })
                          : formatDistanceToNow(new Date(product.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
