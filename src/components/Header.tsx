import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Produtos", href: "/produtos" },
    { name: "Tecnologia", href: "/tecnologia" },
    { name: "Distribuidores", href: "/distribuidores" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-steel/20 bg-navy/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rodotec-blue">
            <span className="font-heading text-xl font-bold text-white">R</span>
          </div>
          <span className="font-heading text-xl font-bold text-white">RODOTEC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:bg-steel hover:text-white"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden text-white/80 hover:bg-steel hover:text-white sm:flex"
          >
            <Globe className="h-5 w-5" />
          </Button>

          <Link to="/contato" className="hidden sm:block">
            <Button className="btn-hero">
              Pedir Orçamento
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-steel">
              <nav className="flex flex-col space-y-4 pt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link to="/contato" className="block">
                  <Button className="btn-hero mt-6 w-full">
                    Pedir Orçamento
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
