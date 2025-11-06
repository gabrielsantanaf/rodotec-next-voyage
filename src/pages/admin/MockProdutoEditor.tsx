import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, X, ImagePlus } from 'lucide-react';

type MockProduct = {
  id?: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'DRAFT';
  price: number | null;
  stock_qty: number;
  category_id: string | null;
  images: { name: string; url: string }[];
};

type MockCategory = { id: string; name: string };

const DRAFT_STORAGE_KEY = 'mock_product_draft';
const PRODUCTS_STORAGE_KEY = 'mock_products';
const CATEGORIES_STORAGE_KEY = 'mock_categories';

export default function MockProdutoEditor() {
  const navigate = useNavigate();

  const defaultCategories: MockCategory[] = useMemo(() => (
    [
      { id: 'cat-carroceria', name: 'Carroceria' },
      { id: 'cat-reboque', name: 'Reboque' },
      { id: 'cat-pecas', name: 'Peças' },
    ]
  ), []);

  const [categories, setCategories] = useState<MockCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MockProduct>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      title: '',
      description: '',
      status: 'DRAFT',
      price: null,
      stock_qty: 0,
      category_id: null,
      images: [],
    };
  });

  useEffect(() => {
    // Carregar categorias mockadas, com fallback local
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      setCategories(parsed?.length ? parsed : defaultCategories);
    } catch {
      setCategories(defaultCategories);
    }
  }, [defaultCategories]);

  useEffect(() => {
    // Persistir rascunho a cada alteração
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch {}
  }, [formData]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.title?.trim()) nextErrors.title = 'Título é obrigatório';
    if (formData.price == null || Number.isNaN(formData.price)) nextErrors.price = 'Preço inválido';
    if ((formData.price ?? 0) < 0) nextErrors.price = 'Preço não pode ser negativo';
    if (formData.stock_qty < 0) nextErrors.stock_qty = 'Estoque não pode ser negativo';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages: { name: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      const url = await readFileAsDataURL(file);
      newImages.push({ name: file.name, url });
    }
    setFormData((p) => ({ ...p, images: [...p.images, ...newImages] }));
    toast.success('Imagens adicionadas localmente');
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadExample = () => {
    const example: MockProduct = {
      title: 'Camiseta de manga curta',
      description: 'Produto de exemplo para edição local.',
      status: 'ACTIVE',
      price: 199.9,
      stock_qty: 25,
      category_id: defaultCategories[0].id,
      images: [],
    };
    setFormData(example);
    toast.success('Dados de exemplo carregados');
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Corrija os erros para continuar');
      return;
    }
    setSaving(true);
    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const list: MockProduct[] = raw ? JSON.parse(raw) : [];
      const newItem: MockProduct = { ...formData, id: String(Date.now()) };
      list.push(newItem);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success('Produto salvo localmente (mock)');
      navigate('/produtos');
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao salvar localmente');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.success('Edição cancelada');
    navigate('/produtos');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Adicionar produto (Mock)</h1>
            <p className="text-muted-foreground">Editor totalmente local, sem back-end</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadExample}>Carregar exemplo</Button>
            <Button variant="destructive" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex.: Camiseta de manga curta"
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'error-title' : undefined}
                  />
                  {errors.title && (
                    <p id="error-title" className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes do produto"
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mídia</Label>
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <ImagePlus className="h-4 w-4" />
                      <span>Fazer upload (simulado)</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="mt-3"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      aria-label="Upload de imagens"
                    />
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {formData.images.map((img, idx) => (
                          <img key={idx} src={img.url} alt={img.name} className="h-24 w-full rounded object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preço e estoque</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    inputMode="decimal"
                    value={formData.price ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, price: v === '' ? null : Number(v) });
                    }}
                    placeholder="R$ 0,00"
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? 'error-price' : undefined}
                  />
                  {errors.price && (
                    <p id="error-price" className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    inputMode="numeric"
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: Number(e.target.value || 0) })}
                    placeholder="0"
                    aria-invalid={!!errors.stock_qty}
                    aria-describedby={errors.stock_qty ? 'error-stock' : undefined}
                  />
                  {errors.stock_qty && (
                    <p id="error-stock" className="text-sm text-destructive">{errors.stock_qty}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status e organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.status === 'ACTIVE'}
                      onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'ACTIVE' : 'DRAFT' })}
                      aria-label="Status do produto"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.status === 'ACTIVE' ? 'Ativo' : 'Rascunho'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category_id ?? ''}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value || null })}
                  >
                    <SelectTrigger aria-label="Escolha uma categoria"><SelectValue placeholder="Escolha uma categoria de produto" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}