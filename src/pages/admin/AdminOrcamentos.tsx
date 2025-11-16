import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  Package,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { toast } from 'sonner';

interface Orcamento {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  produto: string;
  quantidade: number;
  mensagem: string;
  status: 'novo' | 'em_contato' | 'concluido';
  notasInternas: string;
  criadoEm: string;
  atualizadoEm: string;
}

export default function AdminOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadOrcamentos();
  }, []);

  useEffect(() => {
    filterOrcamentos();
  }, [orcamentos, searchTerm, statusFilter]);

  const loadOrcamentos = async () => {
    const res = await api.quotes.list({ page: 1, per_page: 200 });
    setOrcamentos(res.data as any);
  };

  const filterOrcamentos = () => {
    let filtered = orcamentos;

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.telefone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.produto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    setFilteredOrcamentos(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: any }> = {
      novo: { label: 'Novo', variant: 'statusNew' },
      em_contato: { label: 'Em Contato', variant: 'statusProgress' },
      concluido: { label: 'Concluído', variant: 'statusDone' },
    };
    const config = map[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.quotes.updateStatus(id, newStatus);
      toast.success('Status atualizado com sucesso!');
      loadOrcamentos();
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await api.quotes.delete(id);
        toast.success('Orçamento excluído com sucesso!');
        loadOrcamentos();
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao excluir orçamento');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Produto', 'Quantidade', 'Status', 'Data'];
    const rows = filteredOrcamentos.map(o => [
      o.id,
      o.nome,
      o.telefone,
      o.email,
      o.produto,
      o.quantidade.toString(),
      o.status,
      format(new Date(o.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orcamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginação
  const totalPages = Math.ceil(filteredOrcamentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOrcamentos.slice(startIndex, endIndex);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Orçamentos</h1>
            <p className="text-slate-600">Gerencie os orçamentos solicitados pelos clientes</p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filtros */}
        <Card className="bg-surface border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-slate-300">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_contato">Em Contato</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-surface border border-slate-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {filteredOrcamentos.length} orçamento(s) encontrado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        Nenhum orçamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((orcamento) => (
                      <TableRow key={(orcamento as any)._id || (orcamento as any).id}>
                        <TableCell className="font-medium text-slate-900">
                          #{String((orcamento as any)._id || (orcamento as any).id).slice(-6)}
                        </TableCell>
                        <TableCell className="text-slate-900">{orcamento.nome}</TableCell>
                        <TableCell className="text-slate-900">{orcamento.telefone}</TableCell>
                        <TableCell className="text-slate-900">{orcamento.email}</TableCell>
                        <TableCell className="text-slate-900">{(orcamento as any).produto?.nome || (orcamento as any).produto || '—'}</TableCell>
                        <TableCell>
                          <Select
                            value={orcamento.status}
                            onValueChange={(value) => handleStatusChange(String((orcamento as any)._id || (orcamento as any).id), value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="novo">Novo</SelectItem>
                              <SelectItem value="em_contato">Em Contato</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatDistanceToNow(new Date((orcamento as any).createdAt || (orcamento as any).criadoEm), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOrcamento(orcamento);
                                setIsViewModalOpen(true);
                              }}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOrcamento(orcamento);
                                setIsEditModalOpen(true);
                              }}
                              className="h-8 px-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(String((orcamento as any)._id || (orcamento as any).id))}
                              className="h-8 px-2 text-danger hover:text-danger/90"
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
            </div>
          </CardContent>
        </Card>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-gray-300"
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-300"
            >
              Próximo
            </Button>
          </div>
        )}

        {/* Modal de Visualização */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#0B1220]">Detalhes do Orçamento</DialogTitle>
              <DialogDescription>
                Informações completas do orçamento
              </DialogDescription>
            </DialogHeader>
            {selectedOrcamento && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <p className="text-[#0B1220]">{selectedOrcamento.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                    <p className="text-[#0B1220]">{selectedOrcamento.telefone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-[#0B1220]">{selectedOrcamento.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Produto</Label>
                    <p className="text-[#0B1220]">{(selectedOrcamento as any).produto?.nome || (selectedOrcamento as any).produto || '—'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div>{getStatusBadge(selectedOrcamento.status)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Mensagem</Label>
                  <p className="text-[#0B1220] bg-gray-50 p-3 rounded-md">{selectedOrcamento.mensagem}</p>
                </div>
                {(selectedOrcamento as any).observacoes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Notas Internas</Label>
                    <p className="text-[#0B1220] bg-blue-50 p-3 rounded-md">{(selectedOrcamento as any).observacoes}</p>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <p>Criado em: {format(new Date((selectedOrcamento as any).createdAt || (selectedOrcamento as any).criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  {(selectedOrcamento as any).updatedAt && (
                    <p>Atualizado em: {format(new Date((selectedOrcamento as any).updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[#0B1220]">Editar Orçamento</DialogTitle>
              <DialogDescription>
                Atualize as informações do orçamento
              </DialogDescription>
            </DialogHeader>
            {selectedOrcamento && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const observacoes = String(formData.get('observacoes') || '');
                  try {
                    await api.quotes.updateObservacoes(String((selectedOrcamento as any)._id || (selectedOrcamento as any).id), observacoes);
                    toast.success('Orçamento atualizado com sucesso!');
                    await loadOrcamentos();
                    setIsEditModalOpen(false);
                  } catch (err: any) {
                    toast.error(err?.message || 'Erro ao atualizar orçamento');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="observacoes">Notas Internas</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    defaultValue={(selectedOrcamento as any).observacoes}
                    rows={4}
                    className="border-gray-300"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#0D47A1] hover:bg-[#1565C0]">
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
