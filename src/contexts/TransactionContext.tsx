
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, TransactionFormData } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (data: TransactionFormData) => void;
  updateTransaction: (id: string, data: TransactionFormData) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByPeriod: (startDate: string, endDate: string) => Transaction[];
  getTotalBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getCategoryTotals: () => { name: string; value: number; color: string }[];
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('controlly_transactions', []);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = (data: TransactionFormData) => {
    setIsLoading(true);
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      amount: parseFloat(data.amount),
      userId: 'default_user',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [...prev, newTransaction]);
    setIsLoading(false);
  };

  const updateTransaction = (id: string, data: TransactionFormData) => {
    setIsLoading(true);
    setTransactions(prev => 
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...data, amount: parseFloat(data.amount) }
          : transaction
      )
    );
    setIsLoading(false);
  };

  const deleteTransaction = (id: string) => {
    setIsLoading(true);
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    setIsLoading(false);
  };

  const getTransactionsByPeriod = (startDate: string, endDate: string) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const getTotalBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getCategoryTotals = () => {
    const categoryTotals: Record<string, number> = {};
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionsByPeriod,
      getTotalBalance,
      getTotalIncome,
      getTotalExpenses,
      getCategoryTotals,
      isLoading
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
