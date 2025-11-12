import { Link } from "react-router-dom";
import { ChevronRight, Download, FileText, Shield, Zap, Award, MessageCircle, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import productCarroceria from "@/assets/product-carroceria.jpg";

const ProdutoDetalhe = () => {
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
      <section className="border-b border-line bg-surface py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
            <span>/</span>
            <span className="text-foreground">Carroceria Baú em Alumínio</span>
          </nav>
        </div>
      </section>

      {/* Hero Product */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2">
              <img
                src={productCarroceria}
                alt="Carroceria Baú em Alumínio"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h1 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">
                  Carroceria Baú em Alumínio
                </h1>
                <p className="text-xl text-muted-foreground">
                  Durabilidade com menor tara para máxima eficiência operacional
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Principais Benefícios
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    <span className="text-muted-foreground">
                      Redução de até 40% na tara comparado a carrocerias convencionais
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    <span className="text-muted-foreground">
                      Material resistente à corrosão sem necessidade de pintura periódica
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    <span className="text-muted-foreground">
                      Estanqueidade superior para proteção total da carga
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                    <span className="text-muted-foreground">
                      Sistema de ventilação otimizado para cargas sensíveis
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="btn-hero flex-1">
                  Pedir Orçamento
                </Button>
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
      <section className="bg-surface-2 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
            Por que escolher este produto
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
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

      {/* Specifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">
              Especificações Técnicas
            </h2>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between border-b border-line pb-3 last:border-0">
                      <span className="font-medium text-muted-foreground">{spec.label}</span>
                      <span className="font-bold text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="applications" className="rounded-2xl border border-line bg-card px-6">
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

              <AccordionItem value="compatibility" className="rounded-2xl border border-line bg-card px-6">
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

              <AccordionItem value="optionals" className="rounded-2xl border border-line bg-card px-6">
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
      <section className="bg-surface-2 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground">
              Documentação Técnica
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="transition-all hover:border-accent">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-accent" />
                  <h3 className="mb-2 font-heading font-bold text-foreground">Catálogo</h3>
                  <p className="mb-4 text-sm text-muted-foreground">PDF • 2.4 MB</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="transition-all hover:border-accent">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-accent" />
                  <h3 className="mb-2 font-heading font-bold text-foreground">Ficha Técnica</h3>
                  <p className="mb-4 text-sm text-muted-foreground">PDF • 1.1 MB</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </CardContent>
              </Card>

              <Card className="transition-all hover:border-accent">
                <CardContent className="p-6 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-accent" />
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
      <section className="bg-bg py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-heading text-3xl font-bold text-white md:text-4xl">
            Interessado neste produto?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-white/95 p-4 backdrop-blur-sm lg:hidden">
        <div className="flex gap-2">
          <Button 
            className="btn-hero flex-1 gap-2"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento.', '_blank')}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Button>
          <Link to="/contato" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
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
