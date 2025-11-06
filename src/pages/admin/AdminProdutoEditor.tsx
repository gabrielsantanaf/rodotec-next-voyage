import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';

type Product = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
  price: number | null;
  sku: string;
  barcode: string;
  stock_qty: number;
  allow_backorder: boolean;
  weight_kg: number | null;
  dimensions_l: number | null;
  dimensions_a: number | null;
  dimensions_p: number | null;
  country_of_origin: string;
  hs_code: string;
  type: string;
  manufacturer: string;
  media: any[];
  category_id: string | null;
  seo_title: string;
  seo_description: string;
  tags: string[];
  published: boolean;
};

type Category = {
  id: string;
  name: string;
};

export default function AdminProdutoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<Product>({
    title: '',
    slug: '',
    description: '',
    status: 'DRAFT',
    price: null,
    sku: '',
    barcode: '',
    stock_qty: 0,
    allow_backorder: false,
    weight_kg: null,
    dimensions_l: null,
    dimensions_a: null,
    dimensions_p: null,
    country_of_origin: 'Brasil',
    hs_code: '',
    type: '',
    manufacturer: '',
    media: [],
    category_id: null,
    seo_title: '',
    seo_description: '',
    tags: [],
    published: false,
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error loading categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const loadProduct = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading product:', error);
      toast.error('Erro ao carregar produto');
      navigate('/admin/produtos');
    } else {
      setFormData({
        ...data,
        price: data.price ? Number(data.price) : null,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
        dimensions_l: data.dimensions_l ? Number(data.dimensions_l) : null,
        dimensions_a: data.dimensions_a ? Number(data.dimensions_a) : null,
        dimensions_p: data.dimensions_p ? Number(data.dimensions_p) : null,
        tags: data.tags || [],
        media: data.media || [],
      });
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        toast.success('Produto criado com sucesso');
        navigate(`/admin/produtos/${data.id}`);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Descartar alterações?')) {
      navigate('/admin/produtos');
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

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/produtos">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar produto' : 'Novo produto'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDiscard}>
              <X className="h-4 w-4 mr-2" />
              Descartar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição detalhada do produto"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Arraste imagens ou clique para fazer upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Até 10 imagens, máximo 20 MB cada
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Preço (BRL)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU-000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Código de barras</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="0000000000000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock_qty">Quantidade</Label>
                  <Input
                    id="stock_qty"
                    type="number"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_backorder">Permitir vender sem estoque</Label>
                  <Switch
                    id="allow_backorder"
                    checked={formData.allow_backorder}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_backorder: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    step="0.01"
                    value={formData.weight_kg || ''}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dimensions_l">Comprimento (cm)</Label>
                    <Input
                      id="dimensions_l"
                      type="number"
                      step="0.01"
                      value={formData.dimensions_l || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions_l: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions_a">Largura (cm)</Label>
                    <Input
                      id="dimensions_a"
                      type="number"
                      step="0.01"
                      value={formData.dimensions_a || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions_a: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions_p">Altura (cm)</Label>
                    <Input
                      id="dimensions_p"
                      type="number"
                      step="0.01"
                      value={formData.dimensions_p || ''}
                      onChange={(e) => setFormData({ ...formData, dimensions_p: e.target.value ? parseFloat(e.target.value) : null })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country_of_origin">País de origem</Label>
                    <Input
                      id="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hs_code">Código SH</Label>
                    <Input
                      id="hs_code"
                      value={formData.hs_code}
                      onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })}
                      placeholder="0000.00.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listagem em mecanismos de pesquisa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo_title">Título SEO</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="Título para mecanismos de busca"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">Descrição SEO</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Descrição para mecanismos de busca"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>URL</Label>
                  <div className="text-sm text-muted-foreground">
                    /produtos/{formData.slug || 'slug-do-produto'}
                  </div>
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
                <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'DRAFT') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publicação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Site</Label>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organização do produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Filtro, Bomba, Acessório"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Nome do fabricante"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category_id || ''} onValueChange={(value) => setFormData({ ...formData, category_id: value || null })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modelo de tema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Produto padrão</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
