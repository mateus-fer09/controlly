import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoals } from '@/contexts/GoalContext';
import { toast } from '@/components/ui/use-toast';

interface GoalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
  currentAmount: number;
  targetAmount: number;
}

const GoalProgressModal = ({ isOpen, onClose, goalId, goalTitle, currentAmount, targetAmount }: GoalProgressModalProps) => {
  const [amount, setAmount] = useState('');
  const { updateGoalProgress } = useGoals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const progressAmount = parseFloat(amount);
    
    if (currentAmount + progressAmount > targetAmount) {
      const maxAmount = targetAmount - currentAmount;
      if (maxAmount <= 0) {
        toast({
          title: "Meta já concluída",
          description: "Esta meta já foi atingida!",
          variant: "destructive",
        });
        return;
      }
      
      if (!window.confirm(`O valor excede a meta. Máximo permitido: R$ ${maxAmount.toFixed(2)}. Deseja continuar?`)) {
        return;
      }
    }

    updateGoalProgress(goalId, progressAmount);
    
    toast({
      title: "Progresso adicionado!",
      description: `R$ ${progressAmount.toFixed(2)} foi adicionado à meta "${goalTitle}".`,
    });
    
    setAmount('');
    onClose();
  };

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercentage = (currentAmount / targetAmount) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Progresso</DialogTitle>
          <DialogDescription>
            Informe o valor a ser adicionado ao progresso da meta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{goalTitle}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Valor atual:</span>
                <span className="font-medium">R$ {currentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Meta:</span>
                <span className="font-medium">R$ {targetAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Restante:</span>
                <span className="font-medium text-blue-600">R$ {remainingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Progresso:</span>
                <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor a adicionar (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Adicionar Progresso
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalProgressModal;
