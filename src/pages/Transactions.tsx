import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import TransactionModal from '@/components/TransactionModal';
import { useTransactions } from '@/contexts/TransactionContext';
import { Search, Filter, Trash2, Edit, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Obter todas as categorias únicas
  const allCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const handleDeleteTransaction = (id: string, description: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a transação "${description}"?`)) {
      deleteTransaction(id);
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalFiltered = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  };

  return (
    <DashboardLayout activeSection="transactions">
      <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transações</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as suas transações
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <TransactionModal />
          </div>
        </div>

        {/* Filters */}
        <Card className="p-2 sm:p-0">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium max-[380px]:text-xs">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 max-[380px]:text-xs max-[380px]:h-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium max-[380px]:text-xs">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium max-[380px]:text-xs">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} transações encontradas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary of filtered results */}
        {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total das transações filtradas</p>
                <p className={`text-2xl font-bold ${getTotalFiltered() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(getTotalFiltered())}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card className="p-2 sm:p-0">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl max-[380px]:text-base">Lista de Transações</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors max-[380px]:p-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900 max-[380px]:text-xs">{transaction.description}</p>
                            <p className="text-sm text-gray-500 max-[380px]:text-[10px]">
                              {transaction.category} • {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'} max-[380px]:text-xs`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 max-[380px]:h-6 max-[380px]:w-6"
                          >
                            <Trash2 className="h-4 w-4 max-[380px]:h-3 max-[380px]:w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">
                  {transactions.length === 0 
                    ? 'Nenhuma transação encontrada' 
                    : 'Nenhuma transação corresponde aos filtros aplicados'}
                </p>
                <p className="text-sm mt-2">
                  {transactions.length === 0 
                    ? 'Clique em "Nova Transação" para começar!' 
                    : 'Tente ajustar os filtros ou limpar a busca'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
