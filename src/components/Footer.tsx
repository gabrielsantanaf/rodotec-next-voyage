import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
                <span className="font-heading text-xl font-bold text-white">R</span>
              </div>
              <span className="font-heading text-xl font-bold text-white">RODOTEC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Engenharia de precisão para transporte rodoviário. Implementos que movem resultados.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-accent">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-accent">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-accent">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-accent">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/produtos" className="text-sm text-muted-foreground hover:text-white">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/tecnologia" className="text-sm text-muted-foreground hover:text-white">
                  Tecnologia
                </Link>
              </li>
              <li>
                <Link to="/distribuidores" className="text-sm text-muted-foreground hover:text-white">
                  Distribuidores
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-sm text-muted-foreground hover:text-white">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">
              Suporte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/downloads" className="text-sm text-muted-foreground hover:text-white">
                  Downloads
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-muted-foreground hover:text-white">
                  Contato
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-white">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Av. Industrial, 1500<br />São Paulo, SP</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(11) 3000-0000</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>contato@rodotec.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} RODOTEC. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-white">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-white">
                LGPD
              </a>
              <a href="#" className="hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
