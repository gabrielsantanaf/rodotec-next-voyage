import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import type { QuoteRequest } from '@/types/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  Save,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Package,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  concluido: 'Concluído',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  novo: 'default',
  em_contato: 'secondary',
  concluido: 'outline',
};

export default function AdminOrcamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<QuoteRequest | null>(null);

  const [status, setStatus] = useState<'novo' | 'em_contato' | 'concluido'>('novo');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    if (!id) return;

    try {
      const data = await api.quotes.get(id);
      setQuote(data);
      setStatus(data.status);
      setObservacoes(data.observacoes || '');
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading quote:', error);
      toast.error('Erro ao carregar orçamento');
      navigate('/admin/orcamentos');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);

    try {
      // Atualizar status
      await api.quotes.updateStatus(id, status);

      // Atualizar observações
      if (observacoes !== (quote?.observacoes || '')) {
        await api.quotes.updateObservacoes(id, observacoes);
      }

      toast.success('Orçamento atualizado com sucesso');
      loadQuote();
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast.error(error.message || 'Erro ao salvar orçamento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!quote) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Orçamento não encontrado</p>
        </div>
      </AdminLayout>
    );
  }

  const hasChanges =
    status !== quote.status || observacoes !== (quote.observacoes || '');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/orcamentos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Orçamento #{quote._id.slice(-6)}</h1>
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(quote.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Nome
                    </div>
                    <p>{quote.nome}</p>
                  </div>
                  {quote.empresa && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Empresa
                      </div>
                      <p>{quote.empresa}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      E-mail
                    </div>
                    <a href={`mailto:${quote.email}`} className="text-primary hover:underline">
                      {quote.email}
                    </a>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Telefone
                    </div>
                    <a href={`tel:${quote.telefone}`} className="text-primary hover:underline">
                      {quote.telefone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produto de interesse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">
                    {typeof quote.produto === 'object' ? quote.produto.nome : quote.produto}
                  </p>
                  {typeof quote.produto === 'object' && quote.produto._id && (
                    <Link to={`/admin/produtos/${quote.produto._id}`} className="ml-auto">
                      <Button variant="ghost" size="sm">
                        Ver produto <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {quote.mensagem && (
              <Card>
                <CardHeader>
                  <CardTitle>Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{quote.mensagem}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Notas internas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione observações internas sobre este orçamento..."
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 w-0.5 bg-border mt-2" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Orçamento criado</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(quote.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Última atualização</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(quote.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="em_contato">Em Contato</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3">
                  <Badge variant={statusColors[status]}>{statusLabels[status]}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.empresa && (
                  <div>
                    <p className="text-sm font-medium">Empresa</p>
                    <p className="text-sm text-muted-foreground">{quote.empresa}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">ID do Orçamento</p>
                  <p className="text-sm text-muted-foreground font-mono">{quote._id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
