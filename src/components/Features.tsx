
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, FileText, PieChart, CreditCard, DollarSign } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: PieChart,
      title: 'Controle de Gastos',
      description: 'Organize suas despesas por categorias e veja onde seu dinheiro está sendo usado.'
    },
    {
      icon: Target,
      title: 'Metas Financeiras',
      description: 'Defina objetivos e acompanhe seu progresso para conquistar seus sonhos.'
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Detalhados',
      description: 'Gráficos e relatórios completos para análise profunda das suas finanças.'
    },
    {
      icon: FileText,
      title: 'Exportação PDF',
      description: 'Exporte relatórios em PDF para apresentações ou controle pessoal.'
    },
    {
      icon: CreditCard,
      title: 'Gestão de Cartões',
      description: 'Controle todos seus cartões de crédito e débito em um só lugar.'
    },
    {
      icon: DollarSign,
      title: 'Distribuição de Receita',
      description: 'Planeje como distribuir sua renda entre gastos, poupança e investimentos.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Recursos que fazem a diferença
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas para você ter controle total sobre suas finanças
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
