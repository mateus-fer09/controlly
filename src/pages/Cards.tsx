import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, CreditCard, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { useCards } from '@/contexts/CardContext';
import { useTransactions } from '@/contexts/TransactionContext';
import CardModal from '@/components/CardModal';
import { useNavigate } from 'react-router-dom';

const Cards = () => {
  const { cards, deleteCard } = useCards();
  const { transactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const navigate = useNavigate();

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCardTransactions = (cardId: string) => {
    return transactions.filter(t => t.cardId === cardId && t.type === 'expense');
  };

  const getCardMonthlySpent = (cardId: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return transactions
      .filter(t => 
        t.cardId === cardId && 
        t.type === 'expense' &&
        new Date(t.date) >= startOfMonth &&
        new Date(t.date) <= endOfMonth
      )
      .reduce((total, t) => total + t.amount, 0);
  };

  const getDaysUntilDueDate = (dueDate: number) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let dueDateThisMonth = new Date(currentYear, currentMonth, dueDate);
    
    if (dueDateThisMonth < now) {
      dueDateThisMonth = new Date(currentYear, currentMonth + 1, dueDate);
    }
    
    const diffTime = dueDateThisMonth.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cartões</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus cartões de crédito e débito
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
              <span className="block sm:hidden"><Plus className="mx-auto h-5 w-5" /></span>
              <span className="hidden sm:inline">Novo Cartão</span>
            </Button>
          </div>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cartão cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione seus cartões para ter melhor controle dos seus gastos
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cartão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const monthlySpent = getCardMonthlySpent(card.id);
              const cardTransactions = getCardTransactions(card.id);
              const usagePercentage = card.limit ? (monthlySpent / card.limit) * 100 : 0;
              const isNearLimit = usagePercentage > 80;
              const daysUntilDue = card.dueDate ? getDaysUntilDueDate(card.dueDate) : null;
              const isDueSoon = daysUntilDue !== null && daysUntilDue <= 5;

              return (
                <Card key={card.id} className={`${isNearLimit ? 'border-yellow-200' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{card.name}</CardTitle>
                          <Badge variant={card.type === 'credit' ? 'default' : 'secondary'}>
                            {card.type === 'credit' ? 'Crédito' : 'Débito'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          **** **** **** {card.lastFourDigits}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(card)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Informações do cartão de crédito */}
                      {card.type === 'credit' && (
                        <div className="space-y-2">
                          {card.limit && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Limite:</span>
                              <span className="font-medium">{formatCurrency(card.limit)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Gasto atual:</span>
                            <span className={`font-medium ${isNearLimit ? 'text-yellow-600' : 'text-gray-900'}`}>
                              {formatCurrency(monthlySpent)}
                            </span>
                          </div>

                          {card.limit && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Disponível:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(card.limit - monthlySpent)}
                              </span>
                            </div>
                          )}

                          {card.limit && usagePercentage > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Uso do limite:</span>
                              <span className={`font-medium ${isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                                {usagePercentage.toFixed(1)}%
                              </span>
                            </div>
                          )}

                          {card.dueDate && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Vencimento:</span>
                              <span className={`font-medium flex items-center ${isDueSoon ? 'text-red-600' : 'text-gray-600'}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                Dia {card.dueDate}
                                {isDueSoon && (
                                  <AlertTriangle className="h-3 w-3 ml-1" />
                                )}
                              </span>
                            </div>
                          )}

                          {isDueSoon && (
                            <div className="flex items-center text-red-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Vence em {daysUntilDue} dia{daysUntilDue !== 1 ? 's' : ''}
                            </div>
                          )}

                          {isNearLimit && (
                            <div className="flex items-center text-yellow-600 text-sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Próximo do limite
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informações para cartão de débito */}
                      {card.type === 'debit' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Gasto mensal:</span>
                            <span className="font-medium">{formatCurrency(monthlySpent)}</span>
                          </div>
                        </div>
                      )}

                      {/* Estatísticas de transações */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Transações:</span>
                          <span className="font-medium">{cardTransactions.length}</span>
                        </div>
                        
                        {cardTransactions.length > 0 && (
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-gray-600">Total gasto:</span>  
                            <span className="font-medium">
                              {formatCurrency(cardTransactions.reduce((sum, t) => sum + t.amount, 0))}
                            </span>
                          </div>
                        )}
                      </div>

                      {cardTransactions.length > 0 && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            className="w-full mt-4 flex items-center justify-center gap-2"
                            onClick={() => navigate(`/card-transactions/${card.id}`)}
                          >
                            <TrendingUp className="h-4 w-4" />
                            Ver Transações
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          card={editingCard}
        />
      </div>
    </DashboardLayout>
  );
};

export default Cards;
