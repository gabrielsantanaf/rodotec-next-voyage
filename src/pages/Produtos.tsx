import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/services/api";
import type { Product, Category } from "@/types/api";

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'grid' | 'list'>("grid");
  const [categoryId, setCategoryId] = useState<string>("");
  const [availability, setAvailability] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("created_desc");
  const [page, setPage] = useState<number>(1);
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.products.list({ ativo: true, limit: 1000 });
      setProducts(res.dados || []);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.categories.list({ ativa: true, limit: 100 });
      setCategories(res.dados || []);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e);
      setCategories([]);
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
    if (categoryId) {
      list = list.filter((p) => p.categoria?._id === categoryId);
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
  }, [products, search, categoryId, availability, sort]);

  const perPage = view === 'grid' ? 12 : 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-steel/20 bg-navy/50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Produtos</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Nossos Produtos
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Soluções completas em carrocerias e implementos para transporte rodoviário
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Side Navigation - Desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-2">
              <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Categorias
              </h3>
              {categories.map((category) => {
                const isActive = categoryId === category._id;
                return (
                  <button
                    key={category._id}
                    onClick={() => setCategoryId(isActive ? '' : category._id)}
                    className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? "bg-rodotec-blue text-white shadow-lg"
                        : "bg-card text-foreground hover:bg-steel/5"
                    }`}
                  >
                    <span className="font-medium">{category.nome}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {categories.map((category) => {
              const isActive = categoryId === category._id;
              return (
                <button
                  key={category._id}
                  onClick={() => setCategoryId(isActive ? '' : category._id)}
                  className={`flex shrink-0 items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-rodotec-blue text-white"
                      : "bg-card text-foreground"
                  }`}
                >
                  <span>{category.nome}</span>
                </button>
              );
            })}
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative">
                <Input
                  placeholder="Buscar por nome ou SKU"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                  <span className="text-sm text-muted-foreground">Em estoque</span>
                  <Switch checked={availability} onCheckedChange={setAvailability} />
                </div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">Mais recentes</SelectItem>
                    <SelectItem value="created_asc">Mais antigos</SelectItem>
                    <SelectItem value="name_asc">Nome (A→Z)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <button className={`rounded-md px-3 py-2 text-sm ${view === 'grid' ? 'bg-rodotec-blue text-white' : 'bg-card'}`} onClick={() => setView('grid')}>Grid</button>
                  <button className={`rounded-md px-3 py-2 text-sm ${view === 'list' ? 'bg-rodotec-blue text-white' : 'bg-card'}`} onClick={() => setView('list')}>Lista</button>
                </div>
              </div>
            </div>

            {view === 'grid' ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {pagedProducts.map((product, index) => {
                  // Converter Product do backend para formato esperado pelo ProductCard
                  // imagensUrls pode ser array de strings ou array de objetos com url
                  const images = product.imagensUrls 
                    ? product.imagensUrls.map((img: any) => typeof img === 'string' ? img : img.url || img)
                    : (product.imagemPrincipal 
                      ? [typeof product.imagemPrincipal === 'string' 
                        ? product.imagemPrincipal 
                        : product.imagemPrincipal.url || product.imagemPrincipal]
                      : []);
                  const productCardData = {
                    id: product._id,
                    title: product.nome,
                    slug: product._id, // Usar ID como slug temporariamente
                    sku: product.sku,
                    images,
                    stock_qty: product.estoque,
                    category_id: product.categoria?._id || '',
                    created_at: product.createdAt,
                  };
                  return (
                    <div
                      key={product._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={productCardData} onQuickView={() => setQuickView(productCardData)} />
                    </div>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pagedProducts.map((product) => {
                  const images = product.imagensUrls 
                    ? product.imagensUrls.map((img: any) => typeof img === 'string' ? img : img.url || img)
                    : (product.imagemPrincipal 
                      ? [typeof product.imagemPrincipal === 'string' 
                        ? product.imagemPrincipal 
                        : product.imagemPrincipal.url || product.imagemPrincipal]
                      : []);
                  const productCardData = {
                    id: product._id,
                    title: product.nome,
                    slug: product._id,
                    sku: product.sku,
                    images,
                    stock_qty: product.estoque,
                    category_id: product.categoria?._id || '',
                    created_at: product.createdAt,
                  };
                  return (
                    <Card key={product._id} className="border border-line">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="aspect-video w-40 overflow-hidden rounded-md bg-muted">
                          {productCardData.images?.[0] ? (
                            <img src={productCardData.images[0]} alt={productCardData.title} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-bold">{productCardData.title}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {productCardData.sku || '—'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/produtos/${product._id}`} className="text-sm underline">Ver detalhes</Link>
                          <button className="text-sm underline" onClick={() => setQuickView(productCardData)}>Quick View</button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>

        <Dialog open={!!quickView} onOpenChange={(open) => !open && setQuickView(null)}>
          <DialogContent className="sm:max-w-2xl">
            {quickView && (
              <>
                <DialogHeader>
                  <DialogTitle>{quickView.title}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                    {quickView.images?.[0] && (
                      <img src={quickView.images[0]} alt={quickView.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">SKU: {quickView.sku || '—'}</p>
                    <Link to={`/produtos/${quickView.id}`} className="text-sm underline">Ver detalhes</Link>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default Produtos;
