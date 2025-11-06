import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Package, TrendingUp, CheckCircle2, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { QuoteRequest, Product, QuoteStatus } from '@/types/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    new_quotes: 0,
    in_progress_quotes: 0,
    completed_quotes: 0,
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
      const [statsData, quotesData, productsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentQuotes(5),
        dashboardApi.getRecentProducts(5),
      ]);

      setStats(statsData);
      setRecentQuotes(quotesData);
      setRecentProducts(productsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuoteStatusLabel = (status: QuoteStatus) => {
    const labels: Record<QuoteStatus, string> = {
      NEW: 'Novo',
      IN_PROGRESS: 'Em andamento',
      CONTACTED: 'Contatado',
      WON: 'Ganho',
      LOST: 'Perdido',
    };
    return labels[status];
  };

  const getQuoteStatusVariant = (status: QuoteStatus): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<QuoteStatus, "default" | "secondary" | "destructive" | "outline"> = {
      NEW: 'default',
      IN_PROGRESS: 'secondary',
      CONTACTED: 'outline',
      WON: 'default',
      LOST: 'destructive',
    };
    return variants[status];
  };

  const cards = [
    {
      title: 'Novos Orçamentos',
      value: stats.new_quotes,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Em Andamento',
      value: stats.in_progress_quotes,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Concluídos',
      value: stats.completed_quotes,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Produtos Ativos',
      value: stats.active_products,
      icon: Package,
      color: 'text-primary',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimos Orçamentos</CardTitle>
              <Link to="/admin/orcamentos" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : recentQuotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum orçamento encontrado</p>
              ) : (
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <Link
                      key={quote.id}
                      to={`/admin/orcamentos/${quote.id}`}
                      className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{quote.name}</p>
                          {quote.company && (
                            <p className="text-xs text-muted-foreground truncate">{quote.company}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(quote.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <Badge variant={getQuoteStatusVariant(quote.status)} className="text-xs shrink-0">
                          {getQuoteStatusLabel(quote.status)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos Recentes</CardTitle>
              <Link to="/admin/produtos" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : recentProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/produtos/${product.id}`}
                      className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(product.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {product.status === 'ACTIVE' ? 'Ativo' : 'Rascunho'}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
