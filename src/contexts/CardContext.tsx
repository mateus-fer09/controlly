
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card, CardFormData } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface CardContextType {
  cards: Card[];
  addCard: (data: CardFormData) => void;
  updateCard: (id: string, data: CardFormData) => void;
  deleteCard: (id: string) => void;
  getCardById: (id: string) => Card | undefined;
  isLoading: boolean;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const useCards = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};

export const CardProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useLocalStorage<Card[]>('controlly_cards', []);
  const [isLoading, setIsLoading] = useState(false);

  const addCard = (data: CardFormData) => {
    setIsLoading(true);
    const newCard: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      type: data.type,
      lastFourDigits: data.lastFourDigits,
      limit: data.limit ? parseFloat(data.limit) : undefined,
      dueDate: data.dueDate,
      annualFee: data.annualFee ? parseFloat(data.annualFee) : undefined,
      userId: 'default_user',
      createdAt: new Date().toISOString(),
    };

    setCards(prev => [...prev, newCard]);
    setIsLoading(false);
  };

  const updateCard = (id: string, data: CardFormData) => {
    setIsLoading(true);
    setCards(prev => 
      prev.map(card =>
        card.id === id
          ? { 
              ...card, 
              ...data,
              limit: data.limit ? parseFloat(data.limit) : undefined,
              annualFee: data.annualFee ? parseFloat(data.annualFee) : undefined,
            }
          : card
      )
    );
    setIsLoading(false);
  };

  const deleteCard = (id: string) => {
    setIsLoading(true);
    setCards(prev => prev.filter(card => card.id !== id));
    setIsLoading(false);
  };

  const getCardById = (id: string) => {
    return cards.find(card => card.id === id);
  };

  return (
    <CardContext.Provider value={{
      cards,
      addCard,
      updateCard,
      deleteCard,
      getCardById,
      isLoading
    }}>
      {children}
    </CardContext.Provider>
  );
};
