import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const productCategories = [
  {
    title: 'Carrocerias',
    items: [
      { name: 'Carroceria Plataforma', slug: 'carroceria-plataforma' },
      { name: 'Carroceria Baú', slug: 'carroceria-bau' },
      { name: 'Carroceria Graneleira', slug: 'carroceria-graneleira' },
    ],
  },
  {
    title: 'Reboques',
    items: [
      { name: 'Reboque Tanque', slug: 'reboque-tanque' },
      { name: 'Reboque Plataforma', slug: 'reboque-plataforma' },
      { name: 'Reboque Sider', slug: 'reboque-sider' },
    ],
  },
  {
    title: 'Implementos',
    items: [
      { name: 'Implemento Agrícola', slug: 'implemento-agricola' },
      { name: 'Implemento Industrial', slug: 'implemento-industrial' },
    ],
  },
  {
    title: 'Peças & Reposição',
    items: [
      { name: 'Ver catálogo completo', slug: 'pecas-reposicao' },
    ],
  },
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 top-full bg-surface border-t border-line shadow-[var(--shadow-elevated)] z-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {productCategories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/produtos/${item.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      {item.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-line">
          <Link
            to="/produtos"
            onClick={onClose}
            className="inline-flex items-center text-accent hover:text-accent/80 font-medium"
          >
            Ver todos os produtos
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
