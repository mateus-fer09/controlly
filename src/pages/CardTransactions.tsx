import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCards } from '@/contexts/CardContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CardTransactions = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { cards } = useCards();

  const card = cards.find(c => c.id === cardId);
  const cardTransactions = transactions.filter(t => t.cardId === cardId);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!card) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Cartão não encontrado.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Transações do Cartão</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{card.name} (**** {card.lastFourDigits})</CardTitle>
            <div className="text-sm text-gray-500 mt-1">{card.type === 'credit' ? 'Crédito' : 'Débito'}</div>
          </CardHeader>
          <CardContent>
            {cardTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Nenhuma transação encontrada para este cartão.</div>
            ) : (
              <div className="space-y-3">
                {cardTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((t) => (
                    <div key={t.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{t.description}</p>
                        <p className="text-xs text-gray-500">{t.category} • {formatDate(t.date)}</p>
                        {card.type === 'credit' && t.purchaseType && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tipo: {t.purchaseType === 'avista' ? 'À vista' : 'Parcelado'}
                            {t.purchaseType === 'parcelado' && t.installments ? ` • ${t.installments}x` : ''}
                          </p>
                        )}
                      </div>
                      <div className={`font-semibold mt-2 md:mt-0 ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CardTransactions; 