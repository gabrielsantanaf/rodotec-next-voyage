import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Award, Users, CheckCircle2, Phone, Mail, Loader2, Sparkles, Cpu, Recycle } from "lucide-react";
import Header from "@/components/Header";
import { ImprovedFooter } from "@/components/ImprovedFooter";
import ProductCard from "@/components/ProductCard";
import SideNav from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { repository } from "@/data/repository";
import heroImage from "@/assets/hero-truck.jpg";
import productCarroceria from "@/assets/product-carroceria.jpg";
import productReboque from "@/assets/product-reboque.jpg";
import techWelding from "@/assets/tech-welding.jpg";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    message: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      repository.createQuote({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        company_name: formData.company,
        product_interest: null,
        message: formData.message,
        status: 'NEW',
        internal_notes: null,
      });

      setFormSuccess(true);
      toast.success("Solicitação enviada!", {
        description: "Entraremos em contato em breve."
      });

      setFormData({
        name: "",
        company: "",
        phone: "",
        email: "",
        message: ""
      });

      setTimeout(() => setFormSuccess(false), 5000);
    } catch (error) {
      toast.error("Erro ao enviar", {
        description: "Tente novamente ou entre em contato por telefone."
      });
    } finally {
      setFormLoading(false);
    }
  };

  const products = [
    {
      title: "Carrocerias em Alumínio",
      image: productCarroceria,
      features: [
        "Redução de até 40% na tara",
        "Maior capacidade de carga útil",
        "Resistência à corrosão"
      ],
      badge: "Nova Geração",
      link: "/produtos/carroceria"
    },
    {
      title: "Reboques Frigoríficos",
      image: productReboque,
      features: [
        "Estanqueidade superior",
        "Isolamento térmico de alta performance",
        "Durabilidade comprovada"
      ],
      link: "/produtos/reboque"
    },
    {
      title: "Implementos Especiais",
      image: productCarroceria,
      features: [
        "Projetos customizados",
        "Engenharia sob medida",
        "Menor custo total de operação"
      ],
      badge: "+ Eficiente",
      link: "/produtos"
    }
  ];

  const technologies = [
    {
      icon: Shield,
      title: "Alumínio Aeronáutico",
      description: "Ligas de alta resistência com menor peso estrutural"
    },
    {
      icon: Zap,
      title: "Solda Robotizada",
      description: "Precisão milimétrica e uniformidade perfeita"
    },
    {
      icon: Award,
      title: "Pintura Cataforética",
      description: "Proteção anticorrosiva de longa duração"
    },
    {
      icon: Users,
      title: "Testes Destrutivos",
      description: "Validação rigorosa de qualidade e segurança"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SideNav />

      {/* Hero Cinematográfico - 42° Diagonal Autoral */}
      <section className="relative h-[600px] overflow-hidden md:h-[700px] lg:ml-24">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Implementos RODOTEC em alta performance"
            className="h-full w-full object-cover"
          />
          {/* Diagonal mask 42° com gradiente autoral */}
          <div 
            className="diagonal-mask-42 absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(14, 26, 43, 0.65) 0%, rgba(14, 26, 43, 0.1) 100%)'
            }}
          />
        </div>
        
        <div className="relative container mx-auto flex h-full items-center px-4 lg:px-8">
          <div className="max-w-2xl animate-fade-in space-y-6">
            {/* H1 sólido - SEM gradiente */}
            <h1 className="font-heading text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Engenharia que move resultados
            </h1>
            <p className="text-xl text-white/90 md:text-2xl">
              Carrocerias e implementos com menor tara, estanqueidade e maior vida útil
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/produtos">
                <button className="btn-hero flex items-center gap-2">
                  Ver Produtos
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link to="/contato">
                <button className="btn-hero-secondary">
                  Pedir Orçamento
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Chevron Pattern Overlay - 42° autoral */}
        <div className="chevron-pattern absolute bottom-0 right-0 h-32 w-full opacity-20" />
      </section>

      {/* Products Section */}
      <section className="py-20 lg:ml-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">
              Produtos em Destaque
            </h2>
            <p className="text-lg text-muted-foreground">
              Soluções de transporte com engenharia de precisão
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/produtos">
              <Button size="lg" className="btn-hero">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Mosaic - Asymmetric Grid */}
      <section className="bg-bg py-20 lg:ml-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-4xl font-bold text-white md:text-5xl">
              Tecnologia & Inovação
            </h2>
            <p className="text-lg text-muted-foreground">
              Excelência em cada processo produtivo
            </p>
          </div>

          {/* Asymmetric Mosaic Grid - Autoral Layout */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
            {/* Large Card 1 - Spans 2 columns */}
            <Card className="group relative col-span-1 overflow-hidden rounded-2xl border-line bg-surface backdrop-blur-sm transition-all hover:border-accent md:col-span-2 md:row-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative h-full p-8 flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 font-heading text-2xl font-bold text-white">
                    Ecoplate Alumínio
                  </h3>
                  <p className="text-muted-foreground">
                    Liga aeronáutica de alta resistência com até 40% menos peso estrutural. Maior capacidade de carga útil e economia comprovada de combustível.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="group relative overflow-hidden rounded-2xl border-line bg-surface backdrop-blur-sm transition-all hover:border-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-white">
                  Robótica de Precisão
                </h3>
                <p className="text-sm text-muted-foreground">
                  Solda robotizada com tolerância milimétrica
                </p>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="group relative overflow-hidden rounded-2xl border-line bg-surface backdrop-blur-sm transition-all hover:border-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-white">
                  Telemetria Avançada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitoramento em tempo real de performance
                </p>
              </div>
            </Card>

            {/* Card 4 */}
            <Card className="group relative overflow-hidden rounded-2xl border-line bg-surface backdrop-blur-sm transition-all hover:border-accent md:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success">
                  <Recycle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-heading text-lg font-bold text-white">
                    Sustentabilidade Certificada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    100% reciclável com menor pegada de carbono
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-card p-8 text-center">
              <div className="mb-2 font-heading text-5xl font-bold text-accent">
                -40%
              </div>
              <p className="text-muted-foreground">
                Redução média de tara
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-8 text-center">
              <div className="mb-2 font-heading text-5xl font-bold text-warning">
                15+
              </div>
              <p className="text-muted-foreground">
                Anos de experiência
              </p>
            </div>
            <div className="rounded-2xl border border-steel/20 bg-card p-8 text-center">
              <div className="mb-2 font-heading text-5xl font-bold text-rodotec-blue">
                3 anos
              </div>
              <p className="text-muted-foreground">
                Garantia estendida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20 lg:ml-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">
              Principais Novidades
            </h2>
            <p className="text-lg text-muted-foreground">
              Últimas atualizações e lançamentos
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Nova linha Ecoplate Pro",
                category: "Lançamento",
                readTime: "3 min"
              },
              {
                title: "Certificação ISO renovada",
                category: "Qualidade",
                readTime: "2 min"
              },
              {
                title: "Expansão da rede de distribuidores",
                category: "Rede",
                readTime: "4 min"
              },
              {
                title: "Tecnologia de solda robotizada",
                category: "Inovação",
                readTime: "5 min"
              }
            ].map((item, index) => (
              <Card key={index} className="group relative overflow-hidden rounded-2xl border-steel/20 transition-all hover:border-rodotec-blue/40 hover:shadow-lg">
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L45 15 L30 30 Z' fill='%231565F5' transform='rotate(42 30 30)'/%3E%3C/svg%3E")`,
                  }}
                />
                <div className="relative p-6">
                  <div className="mb-4 h-40 rounded-xl bg-steel/20" />
                  <span className="mb-2 inline-block rounded-full bg-rodotec-blue/10 px-3 py-1 text-xs font-medium text-rodotec-blue">
                    {item.category}
                  </span>
                  <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.readTime} de leitura
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-navy py-20 lg:ml-24">
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <h2 className="mb-6 font-heading text-4xl font-bold text-white md:text-5xl">
            Encontre um Distribuidor
          </h2>
          <p className="mb-8 text-xl text-white/80">
            Mais de 50 pontos de venda em todo o Brasil
          </p>
          <Link to="/distribuidores">
            <Button size="lg" className="btn-hero">
              Ver Mapa de Distribuidores
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Formulário de Contato */}
      <section className="py-20 lg:ml-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">
                Solicite um Orçamento
              </h2>
              <p className="text-lg text-muted-foreground">
                Preencha o formulário e entraremos em contato em até 24 horas
              </p>
            </div>

            {formSuccess ? (
              <Card className="p-8 text-center border-green-500/40 bg-green-500/10">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Solicitação Enviada!
                </h3>
                <p className="text-muted-foreground">
                  Recebemos sua mensagem e entraremos em contato em breve.
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome"
                        disabled={formLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Nome da empresa"
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        disabled={formLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Conte-nos sobre seu projeto ou necessidade"
                      rows={5}
                      disabled={formLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Solicitação
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            )}

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="p-6 text-center">
                <Phone className="mx-auto h-8 w-8 text-primary mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-2">
                  Telefone
                </h3>
                <a href="tel:+551130000000" className="text-primary hover:underline">
                  (11) 3000-0000
                </a>
              </Card>
              <Card className="p-6 text-center">
                <Mail className="mx-auto h-8 w-8 text-primary mb-3" />
                <h3 className="font-heading font-bold text-foreground mb-2">
                  E-mail
                </h3>
                <a href="mailto:contato@rodotec.com.br" className="text-primary hover:underline">
                  contato@rodotec.com.br
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <ImprovedFooter />
    </div>
  );
};

export default Index;
