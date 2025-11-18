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
        setProduct({
          title: productData.nome,
          sku: productData.sku,
          images,
          short_description: productData.descricao,
          technical_specs: productData.especificacoes || {},
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
          setProduct({
            title: first.nome,
            sku: first.sku,
            images,
            short_description: first.descricao,
            technical_specs: first.especificacoes || {},
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
    <div className="min-h-screen bg-background">
      <Header />
      <SideNav />

      <main className="pb-20 lg:ml-24">
      <section className="border-b border-steel/20 bg-navy/50 py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link>
            <span>/</span>
            <span className="text-white">Carroceria Baú em Alumínio</span>
          </nav>
        </div>
      </section>

      {/* Hero Product */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-steel/20 bg-steel/5 aspect-video">
                {loading ? (
                  <div className="flex items-center justify-center h-full">Carregando...</div>
                ) : product?.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Sem imagem</div>
                )}
              </div>
              {product?.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="overflow-hidden rounded-md border bg-steel/5 aspect-square">
                      <img src={img} alt={`${product.title} ${idx + 2}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h1 className="mb-2 font-heading text-4xl font-bold text-foreground md:text-5xl">
                  {product?.title || 'Produto'}
                </h1>
                <p className="text-sm text-muted-foreground">SKU: {product?.sku || '—'}</p>
                <p className="mt-2 text-xl text-muted-foreground">
                  {product?.short_description || 'Detalhes do produto'}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Principais Benefícios
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rodotec-blue" />
                    <span className="text-muted-foreground">
                      Redução de até 40% na tara comparado a carrocerias convencionais
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rodotec-blue" />
                    <span className="text-muted-foreground">
                      Material resistente à corrosão sem necessidade de pintura periódica
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rodotec-blue" />
                    <span className="text-muted-foreground">
                      Estanqueidade superior para proteção total da carga
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rodotec-blue" />
                    <span className="text-muted-foreground">
                      Sistema de ventilação otimizado para cargas sensíveis
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" variant="outline" className="flex-1">
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Ficha Técnica
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Product */}
      <section className="bg-steel/5 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
            Por que escolher este produto
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-steel/20">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rodotec-blue text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">Solicitar Orçamento</h2>
            <Card className="border-steel/20">
              <CardContent className="p-6 space-y-4">
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
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input id="nome" name="nome" placeholder="Seu nome" />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" name="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                      <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <Label>Produto</Label>
                      <Input value={product?.title || ''} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea id="mensagem" name="mensagem" rows={4} placeholder="Descreva sua necessidade" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Enviar Solicitação</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">
              Especificações Técnicas
            </h2>

            <Card className="mb-8 border-steel/20">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {product?.technical_specs && Object.entries(product.technical_specs).length > 0 ? (
                    Object.entries(product.technical_specs).map(([label, value], index) => (
                      <div key={index} className="flex justify-between border-b border-steel/10 pb-3 last:border-0">
                        <span className="font-medium text-muted-foreground">{label}</span>
                        <span className="font-bold text-foreground">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma especificação disponível.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="applications" className="rounded-2xl border border-steel/20 bg-card px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Aplicações Ideais
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>• Transporte de paletes e cargas gerais</p>
                  <p>• Distribuição urbana e interestadual</p>
                  <p>• Movimentação de produtos secos e embalados</p>
                  <p>• Logística de e-commerce e varejo</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="compatibility" className="rounded-2xl border border-steel/20 bg-card px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Compatibilidade
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="mb-2">Compatible com os principais chassis do mercado:</p>
                  <p>• Mercedes-Benz (toda linha)</p>
                  <p>• Volkswagen (toda linha)</p>
                  <p>• Scania (toda linha)</p>
                  <p>• Iveco (toda linha)</p>
                  <p>• Ford (toda linha)</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="optionals" className="rounded-2xl border border-steel/20 bg-card px-6">
                <AccordionTrigger className="font-heading font-bold hover:no-underline">
                  Opcionais Disponíveis
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
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
      <section className="bg-steel/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">
              Documentação Técnica
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-steel/20 transition-all hover:border-rodotec-blue/40">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-foreground">Catálogo</h3>
                  <p className="mb-4 text-sm text-muted-foreground">PDF • 2.4 MB</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-steel/20 transition-all hover:border-rodotec-blue/40">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-foreground">Ficha Técnica</h3>
                  <p className="mb-4 text-sm text-muted-foreground">PDF • 1.1 MB</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-steel/20 transition-all hover:border-rodotec-blue/40">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-rodotec-blue" />
                  <h3 className="mb-2 font-heading font-bold text-foreground">Manual</h3>
                  <p className="mb-4 text-sm text-muted-foreground">PDF • 3.8 MB</p>
                  <Button variant="outline" size="sm" className="w-full">
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
      <section className="bg-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-heading text-3xl font-bold text-white md:text-4xl">
            Interessado neste produto?
          </h2>
          <p className="mb-8 text-xl text-white/80">
            Fale com um especialista ou encontre o distribuidor mais próximo
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/contato">
              <Button size="lg" className="btn-hero">
                Falar com Especialista
              </Button>
            </Link>
            <Link to="/distribuidores">
              <button className="btn-hero-secondary">
                Ver Distribuidores
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Sticky Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-steel/20 bg-white/95 p-4 backdrop-blur-sm lg:hidden">
        <div className="flex gap-2">
          <Button 
            className="btn-hero flex-1 gap-2"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento.', '_blank')}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Button>
          <Link to="/contato" className="flex-1">
            <Button variant="outline" className="w-full gap-2 border-rodotec-blue text-rodotec-blue">
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
