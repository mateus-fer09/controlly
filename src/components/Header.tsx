
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Controlly</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
            Recursos
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Preços
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
            Sobre
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
          >
            Usar Agora
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
