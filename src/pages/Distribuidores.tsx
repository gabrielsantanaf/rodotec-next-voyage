import { useState } from "react";
import { MapPin, Phone, Mail, Navigation, Clock, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Distribuidores = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<number | null>(null);

  // Mock data - substituir por dados reais
  const dealers = [
    {
      id: 1,
      name: "RODOTEC São Paulo",
      address: "Av. das Indústrias, 1500 - São Paulo, SP",
      phone: "(11) 3456-7890",
      whatsapp: "11934567890",
      email: "sp@rodotec.com.br",
      hours: "Seg-Sex: 8h-18h",
      services: ["Peças", "Assistência", "Implementos"],
      lat: -23.5505,
      lng: -46.6333
    },
    {
      id: 2,
      name: "RODOTEC Rio de Janeiro",
      address: "Rod. Presidente Dutra, Km 225 - Rio de Janeiro, RJ",
      phone: "(21) 2345-6789",
      whatsapp: "21923456789",
      email: "rj@rodotec.com.br",
      hours: "Seg-Sex: 8h-18h, Sáb: 8h-12h",
      services: ["Peças", "Implementos"],
      lat: -22.9068,
      lng: -43.1729
    },
    {
      id: 3,
      name: "RODOTEC Minas Gerais",
      address: "BR-381, Km 445 - Betim, MG",
      phone: "(31) 3234-5678",
      whatsapp: "31932345678",
      email: "mg@rodotec.com.br",
      hours: "Seg-Sex: 7h30-17h30",
      services: ["Peças", "Assistência", "Implementos"],
      lat: -19.9167,
      lng: -43.9345
    }
  ];

  const states = [
    { value: "all", label: "Todos os Estados" },
    { value: "SP", label: "São Paulo" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "MG", label: "Minas Gerais" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "PR", label: "Paraná" },
    { value: "SC", label: "Santa Catarina" }
  ];

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá! Gostaria de informações sobre produtos RODOTEC.`);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  const handleDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SideNav />

      <main className="lg:ml-24">
        {/* Breadcrumb */}
        <div className="border-b border-line bg-surface py-4">
          <div className="container mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span>/</span>
              <span className="text-foreground">Distribuidores</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-bg py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="mb-4 font-heading text-4xl font-bold text-white md:text-5xl">
                Rede de Distribuidores e Assistência Técnica
              </h1>
              <p className="text-xl text-muted-foreground">
                Mais de 50 pontos de venda em todo o Brasil para atender você com excelência
              </p>
            </div>
          </div>
        </section>

        {/* Split View: List + Map */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cidade ou CEP..."
                  className="bg-white"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full bg-white md:w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Navigation className="h-4 w-4" />
                Usar minha localização
              </Button>
            </div>

            {/* Split Layout */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Dealers List - 40% */}
              <div className="space-y-4 lg:col-span-2">
                {dealers.map((dealer) => (
                  <Card
                    key={dealer.id}
                    className={`cursor-pointer rounded-2xl p-6 transition-all hover:border-accent hover:shadow-lg ${
                      selectedDealer === dealer.id ? "border-accent shadow-lg" : ""
                    }`}
                    onClick={() => setSelectedDealer(dealer.id)}
                  >
                    <h3 className="mb-3 font-heading text-xl font-bold text-foreground">
                      {dealer.name}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <span>{dealer.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-accent" />
                        <span>{dealer.hours}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {dealer.services.map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                          >
                            <Wrench className="h-3 w-3" />
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="btn-hero flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(dealer.whatsapp, dealer.name);
                        }}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${dealer.phone}`;
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${dealer.email}`;
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirections(dealer.address);
                        }}
                      >
                        <Navigation className="h-4 w-4" />
                        Rotas
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder - 60% */}
              <div className="lg:col-span-3">
                <Card className="sticky top-4 h-[600px] overflow-hidden rounded-2xl">
                  <div className="flex h-full items-center justify-center bg-surface-2">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-4 h-12 w-12 text-accent" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Mapa interativo em desenvolvimento
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Integração com Leaflet/Mapbox em breve
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-bg py-20">
          <div className="container mx-auto px-4 text-center lg:px-8">
            <h2 className="mb-6 font-heading text-4xl font-bold text-white md:text-5xl">
              Não encontrou o que procurava?
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
              Entre em contato conosco e encontraremos a melhor solução
            </p>
            <Button size="lg" className="btn-hero">
              Fale Conosco
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Distribuidores;
