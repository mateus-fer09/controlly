import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, PiggyBank, ShoppingBag, Home, Calculator } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { IncomeDistribution } from '@/types';

const IncomeDistributionPage = () => {
  const { getTotalIncome, getTotalExpenses } = useTransactions();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [distribution, setDistribution] = useState<IncomeDistribution>({
    essentials: 50,
    wants: 30,
    savings: 20
  });

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const income = monthlyIncome ? parseFloat(monthlyIncome) : totalIncome;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateDistribution = () => {
    return {
      essentials: (income * distribution.essentials) / 100,
      wants: (income * distribution.wants) / 100,
      savings: (income * distribution.savings) / 100
    };
  };

  const calculated = calculateDistribution();

  const distributionData = [
    { name: 'Necessidades', value: calculated.essentials, color: '#ef4444', icon: Home },
    { name: 'Desejos', value: calculated.wants, color: '#f59e0b', icon: ShoppingBag },
    { name: 'Poupança', value: calculated.savings, color: '#10b981', icon: PiggyBank }
  ];

  const comparisonData = [
    {
      category: 'Necessidades',
      sugerido: calculated.essentials,
      atual: totalExpenses * 0.6, // Estimativa
      color: '#ef4444'
    },
    {
      category: 'Desejos',
      sugerido: calculated.wants,
      atual: totalExpenses * 0.4, // Estimativa
      color: '#f59e0b'
    },
    {
      category: 'Poupança',
      sugerido: calculated.savings,
      atual: Math.max(0, totalIncome - totalExpenses),
      color: '#10b981'
    }
  ];

  const presetDistributions = [
    { name: '50/30/20 (Clássica)', essentials: 50, wants: 30, savings: 20 },
    { name: '60/20/20 (Conservadora)', essentials: 60, wants: 20, savings: 20 },
    { name: '40/30/30 (Agressiva)', essentials: 40, wants: 30, savings: 30 },
    { name: '70/20/10 (Básica)', essentials: 70, wants: 20, savings: 10 }
  ];

  const applyPreset = (preset: typeof presetDistributions[0]) => {
    setDistribution({
      essentials: preset.essentials,
      wants: preset.wants,
      savings: preset.savings
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Distribuição de Receita</h1>
            <p className="text-muted-foreground mt-1">
              Planeje como distribuir sua renda de forma inteligente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gastos Totais</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <PiggyBank className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalIncome - totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Configurar Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income">Renda Mensal (Opcional)</Label>
                <Input
                  id="income"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder={`Atual: ${formatCurrency(totalIncome)}`}
                />
                <p className="text-sm text-gray-600">
                  Deixe em branco para usar sua receita atual
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Necessidades (Essenciais)</Label>
                    <span className="text-sm font-medium">{distribution.essentials}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={distribution.essentials}
                    onChange={(e) => setDistribution({
                      ...distribution,
                      essentials: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-sm text-green-600 font-medium">
                    {formatCurrency(calculated.essentials)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Desejos (Não Essenciais)</Label>
                    <span className="text-sm font-medium">{distribution.wants}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={distribution.wants}
                    onChange={(e) => setDistribution({
                      ...distribution,
                      wants: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-sm text-yellow-600 font-medium">
                    {formatCurrency(calculated.wants)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Poupança/Investimentos</Label>
                    <span className="text-sm font-medium">{distribution.savings}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={distribution.savings}
                    onChange={(e) => setDistribution({
                      ...distribution,
                      savings: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <p className="text-sm text-blue-600 font-medium">
                    {formatCurrency(calculated.savings)}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-600">
                    Total: {distribution.essentials + distribution.wants + distribution.savings}%
                  </p>
                  {(distribution.essentials + distribution.wants + distribution.savings) !== 100 && (
                    <p className="text-sm text-red-600">
                      ⚠️ A soma deve ser 100%
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Distribuições Pré-definidas</Label>
                <div className="grid grid-cols-1 gap-2">
                  {presetDistributions.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="justify-start text-left"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualização da Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-3">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      />
                      <item.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sugerido vs Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="sugerido" fill="#3b82f6" name="Sugerido" />
                <Bar dataKey="atual" fill="#6b7280" name="Atual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalExpenses > (totalIncome * 0.8) && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">⚠️ Atenção aos Gastos</h4>
                  <p className="text-red-700 text-sm mt-1">
                    Seus gastos representam mais de 80% da sua renda. Considere revisar suas despesas.
                  </p>
                </div>
              )}

              {(totalIncome - totalExpenses) < (totalIncome * 0.1) && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">💡 Dica de Poupança</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Tente poupar pelo menos 10% da sua renda. Comece com pequenos valores e aumente gradualmente.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">💰 Regra 50/30/20</h4>
                <p className="text-blue-700 text-sm mt-1">
                  A regra clássica sugere: 50% para necessidades, 30% para desejos e 20% para poupança. 
                  Ajuste conforme sua realidade financeira.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default IncomeDistributionPage;
