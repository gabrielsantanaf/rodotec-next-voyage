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
      <section className="border-b border-steel/20 bg-gradient-to-r from-navy via-navy/95 to-navy/90 py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">Produtos</span>
          </nav>
        </div>
      </section>

      {/* Hero Aprimorado */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy/95 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-rodotec-blue blur-3xl" />
          <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl font-bold text-white md:text-6xl lg:text-7xl mb-6 leading-tight">
              Nossos Produtos
            </h1>
            <p className="text-xl text-white/90 md:text-2xl leading-relaxed">
              Soluções completas em carrocerias e implementos para transporte rodoviário com tecnologia de ponta
            </p>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Side Navigation - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-3">
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-steel/10 shadow-sm">
                <h3 className="mb-5 font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <div className="h-1 w-8 bg-rodotec-blue rounded-full" />
                  Categorias
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategoryId('')}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200 group ${
                      !categoryId
                        ? "bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/20"
                        : "bg-background/50 text-foreground hover:bg-steel/10 hover:translate-x-1"
                    }`}
                  >
                    <span className="font-medium">Todas</span>
                    <span className={`text-xs ${!categoryId ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {products.length}
                    </span>
                  </button>
                  {categories.map((category) => {
                    const isActive = categoryId === category._id;
                    const count = products.filter(p => p.categoria?._id === category._id).length;
                    return (
                      <button
                        key={category._id}
                        onClick={() => setCategoryId(isActive ? '' : category._id)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/20"
                            : "bg-background/50 text-foreground hover:bg-steel/10 hover:translate-x-1"
                        }`}
                      >
                        <span className="font-medium">{category.nome}</span>
                        <span className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-3 lg:hidden scrollbar-hide">
            <button
              onClick={() => setCategoryId('')}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm ${
                !categoryId
                  ? "bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-rodotec-blue/30"
                  : "bg-card text-foreground border border-steel/20 hover:border-rodotec-blue/40"
              }`}
            >
              <span>Todas</span>
              <span className={`text-xs ${!categoryId ? 'text-white/80' : 'text-muted-foreground'}`}>
                {products.length}
              </span>
            </button>
            {categories.map((category) => {
              const isActive = categoryId === category._id;
              const count = products.filter(p => p.categoria?._id === category._id).length;
              return (
                <button
                  key={category._id}
                  onClick={() => setCategoryId(isActive ? '' : category._id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm ${
                    isActive
                      ? "bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-rodotec-blue/30"
                      : "bg-card text-foreground border border-steel/20 hover:border-rodotec-blue/40"
                  }`}
                >
                  <span>{category.nome}</span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Filtros e Busca Aprimorados */}
            <div className="mb-8 bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-steel/10 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative group">
                    <Input
                      placeholder="Buscar por nome ou SKU..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-4 pr-4 py-6 text-base border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20 transition-all rounded-xl"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 bg-background/70 rounded-xl px-4 py-2.5 border border-steel/20">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Em estoque</span>
                    <Switch checked={availability} onCheckedChange={setAvailability} />
                  </div>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-44 border-steel/20 rounded-xl py-2.5">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_desc">Mais recentes</SelectItem>
                      <SelectItem value="created_asc">Mais antigos</SelectItem>
                      <SelectItem value="name_asc">Nome (A→Z)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 bg-background/70 rounded-xl p-1.5 border border-steel/20">
                    <button
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        view === 'grid'
                          ? 'bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setView('grid')}
                    >
                      Grid
                    </button>
                    <button
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        view === 'list'
                          ? 'bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setView('list')}
                    >
                      Lista
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-steel/10">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredProducts.length}</span> produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {view === 'grid' ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
                      className="animate-fade-in transform transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={productCardData} onQuickView={() => setQuickView(productCardData)} />
                    </div>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-steel/10 flex items-center justify-center">
                      <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-foreground">Nenhum produto encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pagedProducts.map((product, index) => {
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
                    <Card
                      key={product._id}
                      className="border border-steel/20 hover:border-rodotec-blue/40 transition-all duration-300 hover:shadow-lg animate-fade-in group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="aspect-video w-full sm:w-48 overflow-hidden rounded-xl bg-steel/10 group-hover:shadow-md transition-shadow">
                          {productCardData.images?.[0] ? (
                            <img
                              src={productCardData.images[0]}
                              alt={productCardData.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading text-lg font-bold text-foreground mb-1 group-hover:text-rodotec-blue transition-colors">
                            {productCardData.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">SKU: {productCardData.sku || '—'}</p>
                          {product.categoria && (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-rodotec-blue/10 text-rodotec-blue rounded-full">
                              {product.categoria.nome}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Link
                            to={`/produtos/${product._id}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rodotec-blue to-accent rounded-lg hover:shadow-lg transition-all duration-200"
                          >
                            Ver detalhes
                          </Link>
                          <button
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-foreground bg-background border border-steel/20 rounded-lg hover:border-rodotec-blue/40 transition-all duration-200"
                            onClick={() => setQuickView(productCardData)}
                          >
                            Visualização rápida
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-steel/10 flex items-center justify-center">
                      <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-foreground">Nenhum produto encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Paginação Aprimorada */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-br from-card to-card/50 rounded-2xl p-2 border border-steel/10 shadow-sm">
              <button
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'text-muted-foreground cursor-not-allowed opacity-50'
                    : 'text-foreground hover:bg-steel/10'
                }`}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              <div className="flex items-center gap-1 px-3">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/30'
                          : 'text-foreground hover:bg-steel/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'text-muted-foreground cursor-not-allowed opacity-50'
                    : 'text-foreground hover:bg-steel/10'
                }`}
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
