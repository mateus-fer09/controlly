import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCards } from '@/contexts/CardContext';
import { CardFormData } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card?: any;
}

const CardModal = ({ isOpen, onClose, card }: CardModalProps) => {
  const { addCard, updateCard } = useCards();
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    type: 'credit',
    lastFourDigits: '',
    limit: '',
    dueDate: undefined,
    annualFee: '',
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        type: card.type,
        lastFourDigits: card.lastFourDigits,
        limit: card.limit?.toString() || '',
        dueDate: card.dueDate,
        annualFee: card.annualFee?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'credit',
        lastFourDigits: '',
        limit: '',
        dueDate: undefined,
        annualFee: '',
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.lastFourDigits) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.lastFourDigits.length !== 4 || !/^\d+$/.test(formData.lastFourDigits)) {
      toast({
        title: "Erro",
        description: "Os últimos 4 dígitos devem conter exatamente 4 números.",
        variant: "destructive",
      });
      return;
    }

    if (formData.limit && parseFloat(formData.limit) <= 0) {
      toast({
        title: "Erro",
        description: "O limite deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (formData.dueDate && (formData.dueDate < 1 || formData.dueDate > 31)) {
      toast({
        title: "Erro",
        description: "O dia de vencimento deve estar entre 1 e 31.",
        variant: "destructive",
      });
      return;
    }

    if (card) {
      updateCard(card.id, formData);
      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso!",
      });
    } else {
      addCard(formData);
      toast({
        title: "Sucesso",
        description: "Cartão adicionado com sucesso!",
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Editar Cartão' : 'Novo Cartão'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar ou editar um cartão.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Nubank Roxinho"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'credit' | 'debit') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFourDigits">Últimos 4 Dígitos *</Label>
            <Input
              id="lastFourDigits"
              value={formData.lastFourDigits}
              onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value })}
              placeholder="1234"
              maxLength={4}
            />
          </div>

          {formData.type === 'credit' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Dia do Vencimento</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Ex: 10"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="annualFee">Anuidade (R$)</Label>
            <Input
              id="annualFee"
              type="number"
              step="0.01"
              min="0"
              value={formData.annualFee}
              onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {card ? 'Atualizar' : 'Adicionar'} Cartão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
