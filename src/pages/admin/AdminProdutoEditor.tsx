import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { repository, slugify } from '@/data/repository';
import type { Product } from '@/data/types';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProdutoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    status: 'DRAFT',
    price: null,
    sku: null,
    stock_qty: 0,
    category_id: '',
    images: [],
    technical_specs: {},
    dimensions: {},
    seo_title: null,
    seo_description: null,
  });

  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const categories = repository.getCategories();

  useEffect(() => {
    if (isEditing && id) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);

  const loadProduct = () => {
    if (!id) return;
    const product = repository.getProduct(id);
    if (!product) {
      toast.error('Produto não encontrado');
      navigate('/admin/produtos');
      return;
    }
    setFormData(product);
    // Convert technical_specs to array
    const specsArray = Object.entries(product.technical_specs || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setSpecs(specsArray);
    setLoading(false);
  };

  const generateSlug = useCallback((title: string) => {
    return slugify(title);
  }, []);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title || prev.seo_title,
    }));
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const maxItems = 10;
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB

    setUploading(true);
    try {
      const currentCount = formData.images?.length || 0;
      if (currentCount + files.length > maxItems) {
        toast.error(`Máximo de ${maxItems} imagens por produto`);
        setUploading(false);
        return;
      }

      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`Arquivo não suportado: ${file.name}`);
          continue;
        }
        if (file.size > maxSizeBytes) {
          toast.error(`Imagem muito grande (${file.name}). Máx 20MB`);
          continue;
        }

        // Convert to Data URL for local storage
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(dataUrl);
      }

      if (newImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newImages],
        }));
        toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Falha ao processar imagens');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleSave = () => {
    // Validations
    if (!formData.title?.trim() || formData.title.length < 3) {
      toast.error('O nome do produto deve ter pelo menos 3 caracteres');
      return;
    }
    if (!formData.category_id) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (formData.status === 'ACTIVE' && (!formData.images || formData.images.length === 0)) {
      toast.error('Adicione ao menos uma imagem para publicar o produto');
      return;
    }

    setSaving(true);

    try {
      // Convert specs array to object
      const technical_specs: Record<string, string> = {};
      specs.forEach((spec) => {
        if (spec.key.trim()) {
          technical_specs[spec.key.trim()] = spec.value.trim();
        }
      });

      const productData: Partial<Product> = {
        ...formData,
        technical_specs,
      };

      if (isEditing && id) {
        repository.updateProduct(id, productData);
        toast.success('Produto atualizado com sucesso');
      } else {
        const created = repository.createProduct(productData);
        toast.success('Produto criado com sucesso');
        navigate(`/admin/produtos/${created.id}`);
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
          {/* Main Column */}
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
                    value={formData.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="slug-do-produto"
                  />
                </div>
                <div>
                  <Label htmlFor="short_description">Descrição curta</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description || ''}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Breve descrição do produto"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição detalhada</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição completa do produto"
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
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Label htmlFor="product-images" className="cursor-pointer">
                    <span className="text-sm font-medium">Clique para adicionar imagens</span>
                    <p className="text-xs text-muted-foreground mt-2">
                      Até 10 imagens, máximo 20 MB cada
                    </p>
                  </Label>
                  <input
                    id="product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`${formData.title} - Imagem ${idx + 1}`}
                          className="aspect-square w-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 bg-background/90 border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remover imagem"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {uploading && (
                  <p className="mt-2 text-sm text-muted-foreground">Processando imagens...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificações técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Nome"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Valor"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSpec(idx)}
                      aria-label="Remover especificação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddSpec}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar especificação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dimensões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Largura (m)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.dimensions?.width || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            width: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (m)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.dimensions?.height || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            height: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Comprimento (m)</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.01"
                      value={formData.dimensions?.length || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            length: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.dimensions?.weight || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: {
                            ...formData.dimensions,
                            weight: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo_title">Título SEO</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title || ''}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="Título para motores de busca"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">Descrição SEO</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description || ''}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Descrição para motores de busca"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'ACTIVE' | 'DRAFT') =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="ACTIVE">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Badge variant={formData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {formData.status === 'ACTIVE' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category_id || ''}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preço e Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : null })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-000"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_qty || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_qty: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
