import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  PieChart, 
  FileText, 
  CreditCard, 
  DollarSign,
  Menu,
  Settings,
  TrendingUp,
  Moon,
  Sun,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

const DashboardLayout = ({ children, activeSection = 'dashboard' }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setCanInstall(false);
      });
    } else {
      toast({
        title: 'Como instalar o app',
        description: (
          <div>
            <p>Para instalar, siga os passos abaixo:</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
              <li>No Chrome ou Edge, clique no ícone de três pontos no canto superior direito do navegador.</li>
              <li>Procure por <b>"Instalar app"</b> ou <b>"Adicionar à tela inicial"</b>.</li>
              <li>Clique nessa opção e confirme a instalação.</li>
            </ol>
          </div>
        )
      });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'transactions', label: 'Transações', icon: PieChart, path: '/transactions' },
    { id: 'goals', label: 'Metas', icon: TrendingUp, path: '/goals' },
    { id: 'reports', label: 'Relatórios', icon: FileText, path: '/reports' },
    { id: 'cards', label: 'Cartões', icon: CreditCard, path: '/cards' },
    { id: 'income', label: 'Distribuição de Receita', icon: DollarSign, path: '/income-distribution' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-card shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border dark:border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-foreground">Controlly</span>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors rounded-md ${
                location.pathname === item.path
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-r-2 border-emerald-500'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-card/70 hover:text-gray-900 dark:hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-border dark:border-border flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-700 dark:text-gray-200 mb-2"
            onClick={handleInstallClick}
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-200"
            onClick={() => { logout(); window.location.href = '/login'; }}
          >
            <span className="h-4 w-4 mr-2">🔒</span>
            Sair
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-200 mt-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white dark:bg-card shadow-sm px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-semibold text-gray-900 dark:text-foreground">Controlly</span>
          <div className="w-6" />
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
