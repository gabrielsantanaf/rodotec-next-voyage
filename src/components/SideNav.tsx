import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Truck, Box, Container, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const SideNav = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // APENAS produtos - navegação funcional
  const navItems = [
    { 
      id: "carrocerias", 
      label: "Carrocerias", 
      icon: Truck, 
      path: "/produtos",
      thumb: "/placeholder.svg"
    },
    { 
      id: "sobre-chassi", 
      label: "Sobre-Chassi", 
      icon: Box, 
      path: "/produtos",
      thumb: "/placeholder.svg"
    },
    { 
      id: "reboques", 
      label: "Reboques", 
      icon: Container, 
      path: "/produtos",
      thumb: "/placeholder.svg"
    },
    { 
      id: "pecas", 
      label: "Peças & Reposição", 
      icon: Wrench, 
      path: "/produtos",
      thumb: "/placeholder.svg"
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] bg-surface backdrop-blur-sm border-r border-line transition-all duration-300 lg:block",
        isExpanded ? "w-80" : "w-24"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="flex h-full flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "group flex items-center gap-4 rounded-xl p-4 transition-all duration-200",
                active
                  ? "bg-brand text-white shadow-[var(--shadow-elevated)]"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand-700"
              )}
            >
              <Icon className={cn("h-6 w-6 shrink-0", active && "text-white")} />
              
              {isExpanded && (
                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                  <span className="whitespace-nowrap font-medium">
                    {item.label}
                  </span>
                  <img 
                    src={item.thumb} 
                    alt={item.label}
                    className="ml-auto h-12 w-16 rounded object-cover opacity-60"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Chevron Pattern Accent */}
      <div className="chevron-pattern absolute bottom-0 left-0 right-0 h-32 opacity-10" />
    </aside>
  );
};

export default SideNav;
