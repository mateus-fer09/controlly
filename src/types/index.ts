export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
  cardId?: string;
  purchaseType?: 'avista' | 'parcelado';
  installments?: number;
}

export interface TransactionFormData {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  date: string;
  cardId?: string;
  purchaseType?: 'avista' | 'parcelado';
  installments?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  type: 'savings' | 'expense_reduction';
  category?: string;
  userId: string;
  createdAt: string;
  completed: boolean;
}

export interface GoalFormData {
  title: string;
  description: string;
  targetAmount: string;
  targetDate: string;
  type: 'savings' | 'expense_reduction';
  category?: string;
}

export interface Card {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  lastFourDigits: string;
  limit?: number;
  dueDate?: number;
  annualFee?: number;
  userId: string;
  createdAt: string;
}

export interface CardFormData {
  name: string;
  type: 'credit' | 'debit';
  lastFourDigits: string;
  limit?: string;
  dueDate?: number;
  annualFee?: string;
}

export interface IncomeDistribution {
  essentials: number; // 50%
  wants: number; // 30%
  savings: number; // 20%
}
