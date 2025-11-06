import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type QuoteRequest = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  product_name: string;
  status: string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  NEW: 'Novo',
  IN_PROGRESS: 'Em andamento',
  CONTACTED: 'Contatado',
  WON: 'Ganho',
  LOST: 'Perdido',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  NEW: 'default',
  IN_PROGRESS: 'secondary',
  CONTACTED: 'secondary',
  WON: 'default',
  LOST: 'destructive',
};

export default function AdminOrcamentos() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading quotes:', error);
    } else {
      setQuotes(data || []);
    }
    setLoading(false);
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase()) ||
      q.company?.toLowerCase().includes(search.toLowerCase()) ||
      q.product_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Solicitações de orçamento do site
          </p>
        </div>

        <div className="bg-white rounded-lg border border-border">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="NEW">Novo</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="CONTACTED">Contatado</SelectItem>
                  <SelectItem value="WON">Ganho</SelectItem>
                  <SelectItem value="LOST">Perdido</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== 'ALL' && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter('ALL')}>
                  Limpar filtro
                </Button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum orçamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id} className="cursor-pointer hover:bg-accent">
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`}>
                        <Badge variant={statusColors[quote.status]}>
                          {statusLabels[quote.status]}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`} className="font-medium hover:underline">
                        {quote.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`} className="text-muted-foreground">
                        {quote.company || '—'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`}>
                        {quote.product_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`} className="text-muted-foreground">
                        {quote.phone}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`} className="text-muted-foreground">
                        {quote.email}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orcamentos/${quote.id}`} className="text-muted-foreground text-sm">
                        {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}