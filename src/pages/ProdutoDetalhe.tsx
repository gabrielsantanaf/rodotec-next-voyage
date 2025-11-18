import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Download, FileText, Shield, Zap, Award, MessageCircle, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ProdutoDetalhe = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [backendProductId, setBackendProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // slug pode ser ID ou slug
      const productId = slug || '';
      
      // Tentar buscar por ID primeiro
      try {
        const productData = await api.products.get(productId);
        // Extrair URLs das imagens corretamente
        const images = productData.imagensUrls
          ? productData.imagensUrls.map((img: any) => typeof img === 'string' ? img : img.url || img)
          : (productData.imagemPrincipal
            ? [typeof productData.imagemPrincipal === 'string'
              ? productData.imagemPrincipal
              : productData.imagemPrincipal.url || productData.imagemPrincipal]
            : []);

        // Garantir que especificacoes seja um objeto (pode vir como string do backend)
        let specs = {};
        if (productData.especificacoes) {
          if (typeof productData.especificacoes === 'string') {
            try {
              specs = JSON.parse(productData.especificacoes);
            } catch (e) {
              console.error('Erro ao fazer parse de especificacoes:', e);
            }
          } else {
            specs = productData.especificacoes;
          }
        }

        setProduct({
          title: productData.nome,
          sku: productData.sku,
          images,
          short_description: productData.descricao,
          technical_specs: specs,
        });
        setBackendProductId(productData._id);
      } catch (e) {
        // Se não encontrou por ID, tentar buscar por nome/slug
        const term = productId.replace(/-/g, ' ');
        const res = await api.products.list({ search: term, limit: 1 });
        const first = res.dados?.[0];
        if (first) {
          const images = first.imagensUrls
            ? first.imagensUrls.map((img: any) => typeof img === 'string' ? img : img.url || img)
            : (first.imagemPrincipal
              ? [typeof first.imagemPrincipal === 'string'
                ? first.imagemPrincipal
                : first.imagemPrincipal.url || first.imagemPrincipal]
              : []);

          // Garantir que especificacoes seja um objeto (pode vir como string do backend)
          let specs = {};
          if (first.especificacoes) {
            if (typeof first.especificacoes === 'string') {
              try {
                specs = JSON.parse(first.especificacoes);
              } catch (e) {
                console.error('Erro ao fazer parse de especificacoes:', e);
              }
            } else {
              specs = first.especificacoes;
            }
          }

          setProduct({
            title: first.nome,
            sku: first.sku,
            images,
            short_description: first.descricao,
            technical_specs: specs,
          });
          setBackendProductId(first._id);
        } else {
          setProduct(null);
          setBackendProductId(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setProduct(null);
      setBackendProductId(null);
    } finally {
      setLoading(false);
    }
  };
  const specifications = [
    { label: "Comprimento", value: "7,50 m" },
    { label: "Largura", value: "2,60 m" },
    { label: "Altura", value: "2,80 m" },
    { label: "Tara", value: "1.200 kg" },
    { label: "Capacidade", value: "15.000 kg" },
    { label: "Material", value: "Alumínio 5083-H111" },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Porta Lateral Opcional",
      description: "Acesso facilitado para cargas especiais com sistema de abertura lateral reforçado"
    },
    {
      icon: Zap,
      title: "Para-choques Escamoteável",
      description: "Otimização do espaço de carga com sistema de recolhimento rápido"
    },
    {
      icon: Award,
      title: "Resistência Superior",
      description: "Estrutura em alumínio de alta resistência com garantia estendida de 3 anos"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SideNav />

      <main className="pb-20 lg:ml-24">
      {/* Breadcrumb - Clean */}
      <section className="border-b bg-slate-50/50 py-3">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-rodotec-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/produtos" className="hover:text-rodotec-blue transition-colors">Produtos</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900 font-medium">{product?.title || 'Produto'}</span>
          </nav>
        </div>
      </section>

      {/* Hero Product */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Gallery Aprimorada */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 aspect-video shadow-sm group">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-rodotec-blue/20 border-t-rodotec-blue rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando...</p>
                    </div>
                  </div>
                ) : product?.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Sem imagem disponível</p>
                    </div>
                  </div>
                )}
              </div>
              {product?.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100 aspect-square hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                      <img
                        src={img}
                        alt={`${product.title} ${idx + 2}`}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl leading-tight tracking-tight">
                  {product?.title || 'Produto'}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="inline-block px-4 py-1.5 text-sm font-medium bg-rodotec-blue/10 text-rodotec-blue rounded-full border border-rodotec-blue/20">
                    SKU: {product?.sku || '—'}
                  </span>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed md:text-xl">
                  {product?.short_description || 'Detalhes do produto'}
                </p>
              </div>

              <div className="space-y-5">
                <h3 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="h-1 w-8 bg-rodotec-blue rounded-full" />
                  Principais Benefícios
                </h3>
                <ul className="space-y-3">
                  {[
                    'Redução de até 40% na tara comparado a carrocerias convencionais',
                    'Material resistente à corrosão sem necessidade de pintura periódica',
                    'Estanqueidade superior para proteção total da carga',
                    'Sistema de ventilação otimizado para cargas sensíveis'
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start group">
                      <div className="mr-3 mt-1.5 h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-br from-rodotec-blue to-accent flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row pt-4">
                <Button size="lg" variant="outline" className="flex-1 border-slate-200 hover:border-rodotec-blue hover:bg-slate-50 transition-all duration-200 h-12">
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Ficha Técnica
                </Button>
                <Button size="lg" className="flex-1 bg-gradient-to-r from-rodotec-blue to-accent hover:shadow-lg hover:shadow-rodotec-blue/30 transition-all duration-200 h-12">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Solicitar Orçamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Product */}
      <section className="bg-slate-50 py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-slate-900 md:text-5xl mb-4 tracking-tight">
              Por que escolher este produto
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tecnologia e qualidade em cada detalhe
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 group"
                >
                  <CardContent className="p-8">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rodotec-blue to-accent text-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 font-heading text-xl font-bold text-slate-900 group-hover:text-rodotec-blue transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solicitar Orçamento */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold text-slate-900 md:text-5xl mb-4 tracking-tight">
                Solicitar Orçamento
              </h2>
              <p className="text-lg text-slate-600">
                Preencha o formulário e entraremos em contato em até 24 horas
              </p>
            </div>
            <Card className="border-slate-200/60 bg-white shadow-sm">
              <CardContent className="p-8 lg:p-10 space-y-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget as HTMLFormElement);
                    const nome = String(formData.get('nome') || '').trim();
                    const email = String(formData.get('email') || '').trim();
                    const telefone = String(formData.get('telefone') || '').trim();
                    const mensagem = String(formData.get('mensagem') || '').trim();

                    if (!nome || !email || !telefone) {
                      toast.error('Preencha nome, e-mail e telefone');
                      return;
                    }

                    try {
                      if (!backendProductId) {
                        toast.error('Produto não encontrado na base para vincular ao orçamento');
                        return;
                      }
                      if (!mensagem || mensagem.length < 10) {
                        toast.error('Mensagem deve ter pelo menos 10 caracteres');
                        return;
                      }
                      await api.quotes.createPublic({
                        nome,
                        email,
                        telefone,
                        mensagem,
                        produto: backendProductId!,
                      });
                      toast.success('Solicitação enviada!');
                      (e.currentTarget as HTMLFormElement).reset();
                    } catch (err: any) {
                      const msg = err?.message || err?.mensagem || 'Erro ao enviar orçamento';
                      toast.error(msg);
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium">Nome *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Seu nome completo"
                        className="h-12 border-slate-200 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="h-12 border-slate-200 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-sm font-medium">Telefone/WhatsApp *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        className="h-12 border-slate-200 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Produto</Label>
                      <Input
                        value={product?.title || ''}
                        readOnly
                        className="h-12 bg-slate-100 border-slate-200 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensagem" className="text-sm font-medium">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      rows={5}
                      placeholder="Descreva sua necessidade, quantidade desejada, prazo de entrega..."
                      className="border-slate-200 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20 resize-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-rodotec-blue to-accent hover:shadow-lg hover:shadow-rodotec-blue/30 transition-all duration-200 h-12"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Enviar Solicitação
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold text-slate-900 md:text-5xl mb-4 tracking-tight">
                Especificações Técnicas
              </h2>
              <p className="text-lg text-slate-600">
                Dados técnicos detalhados do produto
              </p>
            </div>

            <Card className="mb-10 border-slate-200/60 bg-white shadow-sm">
              <CardContent className="p-8 lg:p-10">
                {product?.technical_specs && Object.entries(product.technical_specs).length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {Object.entries(product.technical_specs).map(([label, value], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
                      >
                        <span className="font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                          {label}
                        </span>
                        <span className="font-bold text-slate-900 text-lg">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-900">Nenhuma especificação disponível</p>
                    <p className="text-sm text-slate-500 mt-1">Entre em contato para mais informações</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="applications" className="rounded-2xl border border-slate-200/60 bg-white px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Aplicações Ideais
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-slate-600">
                  <p>• Transporte de paletes e cargas gerais</p>
                  <p>• Distribuição urbana e interestadual</p>
                  <p>• Movimentação de produtos secos e embalados</p>
                  <p>• Logística de e-commerce e varejo</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="compatibility" className="rounded-2xl border border-slate-200/60 bg-white px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Compatibilidade
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  <p className="mb-2">Compatible com os principais chassis do mercado:</p>
                  <p>• Mercedes-Benz (toda linha)</p>
                  <p>• Volkswagen (toda linha)</p>
                  <p>• Scania (toda linha)</p>
                  <p>• Iveco (toda linha)</p>
                  <p>• Ford (toda linha)</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="optionals" className="rounded-2xl border border-slate-200/60 bg-white px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Opcionais Disponíveis
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-slate-600">
                  <p>• Plataforma elevatória traseira</p>
                  <p>• Porta lateral escamoteável</p>
                  <p>• Sistema de amarração de carga</p>
                  <p>• Iluminação interna em LED</p>
                  <p>• Para-choques retrátil</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 font-heading text-3xl font-bold text-slate-900 tracking-tight">
              Documentação Técnica
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200/60 transition-all hover:border-slate-300 hover:shadow-sm">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-slate-900">Catálogo</h3>
                  <p className="mb-4 text-sm text-slate-500">PDF • 2.4 MB</p>
                  <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-rodotec-blue hover:bg-slate-50">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 transition-all hover:border-slate-300 hover:shadow-sm">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-slate-900">Ficha Técnica</h3>
                  <p className="mb-4 text-sm text-slate-500">PDF • 1.1 MB</p>
                  <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-rodotec-blue hover:bg-slate-50">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 transition-all hover:border-slate-300 hover:shadow-sm">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-slate-900">Manual</h3>
                  <p className="mb-4 text-sm text-slate-500">PDF • 3.8 MB</p>
                  <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-rodotec-blue hover:bg-slate-50">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-rodotec-blue to-accent py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-heading text-3xl font-bold text-white md:text-4xl tracking-tight">
            Interessado neste produto?
          </h2>
          <p className="mb-8 text-xl text-white/90">
            Fale com um especialista ou encontre o distribuidor mais próximo
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/contato">
              <Button size="lg" className="bg-white text-rodotec-blue hover:bg-slate-50 h-12 px-8 font-semibold shadow-lg">
                Falar com Especialista
              </Button>
            </Link>
            <Link to="/distribuidores">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-8 font-semibold">
                Ver Distribuidores
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Sticky Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-sm lg:hidden shadow-lg">
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-rodotec-blue to-accent hover:shadow-lg flex-1 gap-2"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento.', '_blank')}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Button>
          <Link to="/contato" className="flex-1">
            <Button variant="outline" className="w-full gap-2 border-slate-200 text-rodotec-blue hover:bg-slate-50">
              <Mail className="h-5 w-5" />
              Orçamento
            </Button>
          </Link>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProdutoDetalhe;
