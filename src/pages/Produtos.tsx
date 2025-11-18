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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb - Clean */}
      <section className="border-b bg-slate-50/50 py-3">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-rodotec-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium">Produtos</span>
          </nav>
        </div>
      </section>

      {/* Hero - Minimalista e Clean */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12 lg:py-16 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl mb-4 tracking-tight">
              Nossos Produtos
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Soluções completas em carrocerias e implementos para transporte rodoviário com a mais alta tecnologia
            </p>
          </div>
        </div>
      </section>

      <div className="bg-slate-50/30 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Side Navigation - Desktop - Clean */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Categorias
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setCategoryId('')}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                        !categoryId
                          ? "bg-rodotec-blue text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">Todas</span>
                      <span className={`text-xs font-semibold ${!categoryId ? 'text-white/90' : 'text-slate-400'}`}>
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
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                            isActive
                              ? "bg-rodotec-blue text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-medium">{category.nome}</span>
                          <span className={`text-xs font-semibold ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filters - Clean */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
              <button
                onClick={() => setCategoryId('')}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  !categoryId
                    ? "bg-rodotec-blue text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                <span>Todas</span>
                <span className={`text-xs font-semibold ${!categoryId ? 'text-white/90' : 'text-slate-400'}`}>
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
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-rodotec-blue text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span>{category.nome}</span>
                    <span className={`text-xs font-semibold ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Products */}
            <div className="flex-1">
              {/* Filtros e Busca - Clean e Moderno */}
              <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Input
                        placeholder="Buscar por nome ou SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-4 pr-10 h-11 text-sm bg-slate-50 border-slate-200 focus:border-rodotec-blue focus:ring-1 focus:ring-rodotec-blue/20 rounded-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3.5 py-2 border border-slate-200">
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Em estoque</span>
                      <Switch checked={availability} onCheckedChange={setAvailability} />
                    </div>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-40 h-11 border-slate-200 bg-slate-50 rounded-lg text-sm">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_desc">Mais recentes</SelectItem>
                        <SelectItem value="created_asc">Mais antigos</SelectItem>
                        <SelectItem value="name_asc">Nome (A→Z)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                      <button
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                          view === 'grid'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setView('grid')}
                      >
                        Grid
                      </button>
                      <button
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                          view === 'list'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setView('list')}
                      >
                        Lista
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filteredProducts.length}</span> produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
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
                    <Link
                      key={product._id}
                      to={`/produtos/${product._id}`}
                      className="group animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                          {productCardData.images?.[0] ? (
                            <img
                              src={productCardData.images[0]}
                              alt={productCardData.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-rodotec-blue transition-colors">
                            {productCardData.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">SKU: {productCardData.sku || '—'}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-slate-900 mb-1">Nenhum produto encontrado</p>
                    <p className="text-sm text-slate-500">Tente ajustar os filtros de busca</p>
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
                    <Link
                      key={product._id}
                      to={`/produtos/${product._id}`}
                      className="block animate-fade-in"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                        <div className="aspect-video w-full sm:w-40 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {productCardData.images?.[0] ? (
                            <img
                              src={productCardData.images[0]}
                              alt={productCardData.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-rodotec-blue transition-colors">
                            {productCardData.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono mb-2">SKU: {productCardData.sku || '—'}</p>
                          {product.categoria && (
                            <span className="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                              {product.categoria.nome}
                            </span>
                          )}
                        </div>
                        <div className="text-rodotec-blue group-hover:translate-x-1 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {pagedProducts.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-slate-900 mb-1">Nenhum produto encontrado</p>
                    <p className="text-sm text-slate-500">Tente ajustar os filtros de busca</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

          {/* Paginação - Clean e Moderna */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-slate-200/60">
                <button
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    currentPage === 1
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                <div className="flex items-center gap-1 px-2">
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
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-rodotec-blue text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    currentPage === totalPages
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
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
