import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTransactions } from '@/contexts/TransactionContext';
import { useCards } from '@/contexts/CardContext';
import { TransactionFormData } from '@/types';

interface TransactionModalProps {
  trigger?: React.ReactNode;
  prefilledCategory?: string;
}

const TransactionModal = ({ trigger, prefilledCategory }: TransactionModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: '',
    description: '',
    category: prefilledCategory || '',
    date: new Date().toISOString().split('T')[0],
    cardId: ''
  });

  const { addTransaction, isLoading } = useTransactions();
  const { cards } = useCards();

  const categories = {
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Outros'],
    income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Bonificação', 'Outros']
  };

  const selectedCard = cards.find(card => card.id === formData.cardId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      const transactionData = {
        ...formData,
        cardId: formData.cardId || undefined
      };
      
      addTransaction(transactionData);
      
      toast({
        title: "Transação adicionada!",
        description: `${formData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${parseFloat(formData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi registrada.`,
      });
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: prefilledCategory || '',
        date: new Date().toISOString().split('T')[0],
        cardId: ''
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a transação",
        variant: "destructive",
      });
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: prefilledCategory || ''
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar uma nova transação.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={formData.type === 'expense' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('expense')}
              className="flex-1"
            >
              Despesa
            </Button>
            <Button
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('income')}
              className="flex-1"
            >
              Receita
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'expense' && cards.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="card">Cartão (Opcional)</Label>
              <Select 
                value={formData.cardId || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cardId: value, purchaseType: undefined, installments: undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cartão</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} (**** {card.lastFourDigits})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === 'expense' && formData.cardId && formData.cardId !== 'none' && selectedCard?.type === 'credit' && (
            <div className="space-y-2">
              <Label>Tipo de Compra *</Label>
              <Select
                value={formData.purchaseType || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, purchaseType: value as 'avista' | 'parcelado', installments: value === 'parcelado' ? prev.installments : undefined }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de compra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avista">À vista</SelectItem>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === 'expense' && formData.cardId && formData.cardId !== 'none' && selectedCard?.type === 'credit' && formData.purchaseType === 'parcelado' && (
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas *</Label>
              <Input
                id="installments"
                type="number"
                min={2}
                max={24}
                value={formData.installments || ''}
                onChange={e => setFormData(prev => ({ ...prev, installments: Number(e.target.value) }))}
                placeholder="Ex: 3"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
