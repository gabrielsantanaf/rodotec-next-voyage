import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  Package,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  FolderOpen,
  Warehouse,
  TrendingUp,
  FileEdit,
  Globe,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const sidebarItems = [
  { icon: Home, label: 'Início', path: '/admin' },
  { icon: FileText, label: 'Orçamentos', path: '/admin/orcamentos' },
  { icon: Package, label: 'Produtos', path: '/admin/produtos' },
  { icon: FolderOpen, label: 'Coleções', path: '/admin/colecoes' },
  { icon: Warehouse, label: 'Estoque', path: '/admin/estoque' },
  { icon: Users, label: 'Clientes', path: '/admin/clientes' },
  { icon: TrendingUp, label: 'Marketing', path: '/admin/marketing' },
  { icon: FileEdit, label: 'Conteúdo', path: '/admin/conteudo' },
  { icon: Globe, label: 'Markets', path: '/admin/markets' },
  { icon: BarChart3, label: 'Análises', path: '/admin/analises' },
  { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAdminAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'AD';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Top Bar */}
      <header className="bg-white border-b border-border h-14 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-bold text-lg">
              RODOTEC <span className="text-muted-foreground font-normal">– Admin</span>
            </Link>
            
            <div className="relative ml-4 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10 w-64 h-9 bg-[#F4F6F8] border-none"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Minha conta</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-border overflow-y-auto">
        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#F4F6F8] text-foreground'
                    : 'text-muted-foreground hover:bg-[#F4F6F8] hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-56 pt-14">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}