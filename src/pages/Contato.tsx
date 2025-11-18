import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import type { Product } from '@/types/api';
import { toast } from 'sonner';

const Contato = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    productId: '',
    message: '',
    consentLGPD: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.products.list({ ativo: true, limit: 100 });
      setProducts(res.dados || []);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validação básica
      if (!formData.name || !formData.email || !formData.phone || !formData.message) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }

      if (!formData.productId) {
        toast.error('Por favor, selecione um produto de interesse');
        setIsSubmitting(false);
        return;
      }

      if (!formData.consentLGPD) {
        toast.error('É necessário aceitar a Política de Privacidade');
        setIsSubmitting(false);
        return;
      }

      // Enviar para API (público, sem token)
      await api.quotes.createPublic({
        nome: formData.name,
        telefone: formData.phone,
        email: formData.email,
        empresa: formData.company || undefined,
        produto: formData.productId,
        mensagem: formData.message,
      });

      toast.success('Solicitação enviada com sucesso!', {
        description: 'Retornaremos em breve. Obrigado pelo contato.',
      });

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        productId: '',
        message: '',
        consentLGPD: false,
      });

      // Reset form element
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Error submitting quote request:', error);
      toast.error('Erro ao enviar solicitação', {
        description: error?.message || 'Por favor, tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <section className="border-b border-steel/20 bg-gradient-to-r from-navy via-navy/95 to-navy/90 py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">Contato</span>
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
              Entre em Contato
            </h1>
            <p className="text-xl text-white/90 md:text-2xl leading-relaxed">
              Estamos prontos para atender você. Preencha o formulário ou use nossos canais diretos.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-steel/10 bg-gradient-to-br from-card to-card/50 hover:border-rodotec-blue/40 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/30 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground">Endereço</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Av. Industrial, 1500
                    <br />
                    Distrito Industrial
                    <br />
                    São Paulo, SP - CEP 01000-000
                  </p>
                </CardContent>
              </Card>

              <Card className="border-steel/10 bg-gradient-to-br from-card to-card/50 hover:border-rodotec-blue/40 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/30 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground">Telefone</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    <a href="tel:+551130000000" className="hover:text-rodotec-blue transition-colors">
                      (11) 3000-0000
                    </a>
                    <br />
                    <a href="tel:+5511980000000" className="hover:text-rodotec-blue transition-colors">
                      (11) 98000-0000
                    </a>
                    <br />
                    Segunda a Sexta, 8h às 18h
                  </p>
                </CardContent>
              </Card>

              <Card className="border-steel/10 bg-gradient-to-br from-card to-card/50 hover:border-rodotec-blue/40 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rodotec-blue to-accent text-white shadow-lg shadow-rodotec-blue/30 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-bold text-foreground">E-mail</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    <a href="mailto:contato@rodotec.com.br" className="hover:text-rodotec-blue transition-colors">
                      contato@rodotec.com.br
                    </a>
                    <br />
                    <a href="mailto:vendas@rodotec.com.br" className="hover:text-rodotec-blue transition-colors">
                      vendas@rodotec.com.br
                    </a>
                    <br />
                    <a href="mailto:suporte@rodotec.com.br" className="hover:text-rodotec-blue transition-colors">
                      suporte@rodotec.com.br
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-steel/10 bg-gradient-to-br from-card to-card/50 shadow-xl">
                <CardContent className="p-8 lg:p-10">
                  <div className="mb-8">
                    <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                      Solicitar Orçamento
                    </h2>
                    <p className="text-muted-foreground">
                      Preencha os dados abaixo e retornaremos em breve
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium">Empresa</Label>
                        <Input
                          id="company"
                          placeholder="Nome da empresa"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="h-12 border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-12 border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium">Produto de Interesse *</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={(value) => setFormData({ ...formData, productId: value })}
                      >
                        <SelectTrigger className="h-12 border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Carregando produtos...
                            </SelectItem>
                          ) : (
                            products.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">Mensagem *</Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva suas necessidades, quantidade, prazo de entrega..."
                        rows={6}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="border-steel/20 focus:border-rodotec-blue/50 focus:ring-2 focus:ring-rodotec-blue/20 resize-none"
                      />
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={formData.consentLGPD}
                        onChange={(e) =>
                          setFormData({ ...formData, consentLGPD: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 rounded border-steel/20 text-rodotec-blue focus:ring-2 focus:ring-rodotec-blue/20"
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                        Concordo com a{' '}
                        <a href="#" className="text-rodotec-blue hover:underline font-medium">
                          Política de Privacidade
                        </a>{' '}
                        e autorizo o contato da RODOTEC
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-rodotec-blue to-accent hover:shadow-lg hover:shadow-rodotec-blue/30 transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </div>
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
