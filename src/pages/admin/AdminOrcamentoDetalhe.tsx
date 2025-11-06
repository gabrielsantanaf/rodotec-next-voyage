import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Save, ExternalLink, Mail, Phone, Building, Package, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type QuoteRequest = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  product_id: string | null;
  product_name: string;
  message: string | null;
  consent_lgpd: boolean | null;
  status: string;
  assignee: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

const statusLabels: Record<string, string> = {
  NEW: 'Novo',
  IN_PROGRESS: 'Em andamento',
  CONTACTED: 'Contatado',
  WON: 'Ganho',
  LOST: 'Perdido',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  NEW: 'default',
  IN_PROGRESS: 'secondary',
  CONTACTED: 'outline',
  WON: 'default',
  LOST: 'destructive',
};

export default function AdminOrcamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<QuoteRequest | null>(null);

  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading quote:', error);
      toast.error('Erro ao carregar orçamento');
      navigate('/admin/orcamentos');
    } else {
      setQuote(data);
      setStatus(data.status);
      setAssignee(data.assignee || '');
      setNotes(data.notes || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          status,
          assignee: assignee || null,
          notes: notes || null,
        })
        .eq('id', id);

      if (error) throw error;

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

  const hasChanges = status !== quote.status || assignee !== (quote.assignee || '') || notes !== (quote.notes || '');

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
            <h1 className="text-2xl font-bold">Orçamento #{quote.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
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
                    <p>{quote.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      Empresa
                    </div>
                    <p>{quote.company || '—'}</p>
                  </div>
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
                    <a href={`tel:${quote.phone}`} className="text-primary hover:underline">
                      {quote.phone}
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
                  <p className="font-medium">{quote.product_name}</p>
                  {quote.product_id && (
                    <Link to={`/admin/produtos/${quote.product_id}`} className="ml-auto">
                      <Button variant="ghost" size="sm">
                        Ver produto <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {quote.message && (
              <Card>
                <CardHeader>
                  <CardTitle>Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{quote.message}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Notas internas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                        {format(new Date(quote.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">Origem: {quote.source || 'Formulário do site'}</p>
                    </div>
                  </div>

                  {quote.updated_at !== quote.created_at && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Última atualização</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(quote.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Novo</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                    <SelectItem value="CONTACTED">Contatado</SelectItem>
                    <SelectItem value="WON">Ganho</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3">
                  <Badge variant={statusColors[status]}>
                    {statusLabels[status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Atribuir para</Label>
                  <Input
                    id="assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Consentimento LGPD</p>
                  <p className="text-sm text-muted-foreground">
                    {quote.consent_lgpd ? 'Sim, aceito' : 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Origem</p>
                  <p className="text-sm text-muted-foreground">{quote.source || 'Formulário do site'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
