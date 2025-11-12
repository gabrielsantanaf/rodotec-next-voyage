import { useState } from "react";
import { Link } from "react-router-dom";
import { Truck, Container, Box, Wrench, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import productCarroceria from "@/assets/product-carroceria.jpg";
import productReboque from "@/assets/product-reboque.jpg";

const Produtos = () => {
  const [activeCategory, setActiveCategory] = useState("todos");

  const categories = [
    { id: "todos", name: "Todos", icon: Box },
    { id: "carrocerias", name: "Carrocerias", icon: Truck },
    { id: "reboques", name: "Reboques", icon: Container },
    { id: "especiais", name: "Especiais", icon: Wrench },
  ];

  const products = [
    {
      title: "Carroceria Baú em Alumínio",
      image: productCarroceria,
      features: [
        "Estrutura em alumínio aeronáutico de alta resistência",
        "Redução de até 40% no peso total",
        "Maior capacidade de carga útil"
      ],
      badge: "Nova Geração",
      link: "/produtos/carroceria",
      category: "carrocerias"
    },
    {
      title: "Reboque Frigorífico",
      image: productReboque,
      features: [
        "Isolamento térmico superior",
        "Sistema de vedação estanque",
        "Compatível com todos os chassis"
      ],
      link: "/produtos/reboque",
      category: "reboques"
    },
    {
      title: "Carroceria Graneleira",
      image: productCarroceria,
      features: [
        "Ideal para transporte de grãos e sacarias",
        "Tampa telescópica opcional",
        "Ventilação lateral reforçada"
      ],
      link: "/produtos/carroceria",
      category: "carrocerias"
    },
    {
      title: "Implemento para Paletes",
      image: productReboque,
      features: [
        "Porta lateral escamoteável",
        "Para-choques retrátil",
        "Otimização de espaço interno"
      ],
      badge: "+ Eficiente",
      link: "/produtos/carroceria",
      category: "especiais"
    },
    {
      title: "Carroceria Sider",
      image: productCarroceria,
      features: [
        "Abertura lateral completa",
        "Estrutura reforçada em alumínio",
        "Facilidade de carga e descarga"
      ],
      link: "/produtos/carroceria",
      category: "carrocerias"
    },
    {
      title: "Reboque Carga Seca",
      image: productReboque,
      features: [
        "Versatilidade para diversos tipos de carga",
        "Manutenção simplificada",
        "Excelente relação custo-benefício"
      ],
      link: "/produtos/reboque",
      category: "reboques"
    }
  ];

  const filteredProducts = activeCategory === "todos" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-line bg-surface py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Produtos</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-bg py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Nossos Produtos
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
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
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left transition-all ${
                      isActive
                        ? "bg-brand text-white shadow-lg"
                        : "bg-card text-foreground hover:bg-surface-2"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile Category Filter */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex shrink-0 items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-card text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Produtos;
