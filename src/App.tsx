import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { GoalProvider } from "@/contexts/GoalContext";
import { CardProvider } from "@/contexts/CardContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Reports from "./pages/Reports";
import Cards from "./pages/Cards";
import IncomeDistribution from "./pages/IncomeDistribution";
import NotFound from "./pages/NotFound";
import CardTransactions from "./pages/CardTransactions";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn()) {
    window.location.href = '/register';
    return null;
  }
  return children;
}

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TransactionProvider>
          <GoalProvider>
            <CardProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                  <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
                  <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
                  <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
                  <Route path="/cards" element={<RequireAuth><Cards /></RequireAuth>} />
                  <Route path="/income-distribution" element={<RequireAuth><IncomeDistribution /></RequireAuth>} />
                  <Route path="/card-transactions/:cardId" element={<RequireAuth><CardTransactions /></RequireAuth>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CardProvider>
          </GoalProvider>
        </TransactionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
