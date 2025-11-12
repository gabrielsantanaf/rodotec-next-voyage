import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Phone, Mail, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contato = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    productName: 'Outro',
    message: '',
    consentLGPD: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('quote_requests')
        .insert([
          {
            name: formData.name,
            company: formData.company || null,
            email: formData.email,
            phone: formData.phone,
            product_name: formData.productName,
            message: formData.message,
            consent_lgpd: formData.consentLGPD,
            status: 'NEW',
            source: 'SITE_FORM',
          },
        ]);

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso!", {
        description: "Retornaremos em breve. Obrigado pelo contato.",
      });

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        productName: 'Outro',
        message: '',
        consentLGPD: false,
      });

      // Reset form element
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Error submitting quote request:', error);
      toast.error("Erro ao enviar solicitação", {
        description: "Por favor, tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <section className="border-b border-line bg-surface-2 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Contato</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-bg py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
            Entre em Contato
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Estamos prontos para atender você. Preencha o formulário ou use nossos canais diretos.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <MapPin className="mb-4 h-8 w-8 text-accent" />
                  <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                    Endereço
                  </h3>
                  <p className="text-muted-foreground">
                    Av. Industrial, 1500<br />
                    Distrito Industrial<br />
                    São Paulo, SP - CEP 01000-000
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Phone className="mb-4 h-8 w-8 text-accent" />
                  <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                    Telefone
                  </h3>
                  <p className="text-muted-foreground">
                    (11) 3000-0000<br />
                    (11) 98000-0000<br />
                    Segunda a Sexta, 8h às 18h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Mail className="mb-4 h-8 w-8 text-accent" />
                  <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                    E-mail
                  </h3>
                  <p className="text-muted-foreground">
                    contato@rodotec.com.br<br />
                    vendas@rodotec.com.br<br />
                    suporte@rodotec.com.br
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
                    Solicitar Orçamento
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          placeholder="Nome da empresa"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product">Produto de Interesse</Label>
                      <Select value={formData.productName} onValueChange={(value) => setFormData({ ...formData, productName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Carroceria Baú">Carroceria Baú</SelectItem>
                          <SelectItem value="Reboque Frigorífico">Reboque Frigorífico</SelectItem>
                          <SelectItem value="Carroceria Graneleira">Carroceria Graneleira</SelectItem>
                          <SelectItem value="Carroceria Sider">Carroceria Sider</SelectItem>
                          <SelectItem value="Implemento Especial">Implemento Especial</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva suas necessidades e dúvidas..."
                        rows={6}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={formData.consentLGPD}
                        onChange={(e) => setFormData({ ...formData, consentLGPD: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-line"
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground">
                        Concordo com a{" "}
                        <a href="#" className="text-accent hover:underline">
                          Política de Privacidade
                        </a>{" "}
                        e autorizo o contato da RODOTEC
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="btn-hero w-full"
                    >
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          Enviar Mensagem
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contato;
