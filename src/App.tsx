import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import Index from "./pages/Index";
import Produtos from "./pages/Produtos";
import ProdutoDetalhe from "./pages/ProdutoDetalhe";
import Contato from "./pages/Contato";
import Distribuidores from "./pages/Distribuidores";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProdutos from "./pages/admin/AdminProdutos";
import AdminProdutoEditor from "./pages/admin/AdminProdutoEditor";
import MockProdutoEditor from "./pages/admin/MockProdutoEditor";
import AdminOrcamentos from "./pages/admin/AdminOrcamentos";
import AdminOrcamentoDetalhe from "./pages/admin/AdminOrcamentoDetalhe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produtos/:slug" element={<ProdutoDetalhe />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/tecnologia" element={<Index />} />
            <Route path="/distribuidores" element={<Distribuidores />} />
            <Route path="/sobre" element={<Index />} />

            {/* Sandbox público sem autenticação */}
            <Route path="/sandbox/produtos/novo" element={<MockProdutoEditor />} />

            {/* Admin - Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin - Protegido */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/produtos"
              element={
                <ProtectedAdminRoute>
                  <AdminProdutos />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/produtos/novo"
              element={
                <ProtectedAdminRoute>
                  <AdminProdutoEditor />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/produtos/:id"
              element={
                <ProtectedAdminRoute>
                  <AdminProdutoEditor />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orcamentos"
              element={
                <ProtectedAdminRoute>
                  <AdminOrcamentos />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orcamentos/:id"
              element={
                <ProtectedAdminRoute>
                  <AdminOrcamentoDetalhe />
                </ProtectedAdminRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
