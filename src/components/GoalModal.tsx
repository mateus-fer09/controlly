import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoals } from '@/contexts/GoalContext';
import { GoalFormData } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: any;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Casa',
  'Roupas',
  'Outros'
];

const GoalModal = ({ isOpen, onClose, goal }: GoalModalProps) => {
  const { addGoal, updateGoal } = useGoals();
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    type: 'savings',
    category: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate,
        type: goal.type,
        category: goal.category || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        type: 'savings',
        category: '',
      });
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast({
        title: "Erro",
        description: "O valor da meta deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.targetDate) <= new Date()) {
      toast({
        title: "Erro",
        description: "A data da meta deve ser futura.",
        variant: "destructive",
      });
      return;
    }

    if (goal) {
      updateGoal(goal.id, formData);
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso!",
      });
    } else {
      addGoal(formData);
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!",
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar ou editar uma meta financeira.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Reserva de emergência"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sua meta..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Meta</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'savings' | 'expense_reduction') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Meta de Economia</SelectItem>
                <SelectItem value="expense_reduction">Redução de Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'expense_reduction' && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor da Meta (R$) *</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Data Limite *</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {goal ? 'Atualizar' : 'Criar'} Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;
