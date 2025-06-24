
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal, GoalFormData } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTransactions } from './TransactionContext';

interface GoalContextType {
  goals: Goal[];
  addGoal: (data: GoalFormData) => void;
  updateGoal: (id: string, data: GoalFormData) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  getGoalProgress: (goalId: string) => { percentage: number; remaining: number };
  isLoading: boolean;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useLocalStorage<Goal[]>('controlly_goals', []);
  const [isLoading, setIsLoading] = useState(false);
  const { transactions } = useTransactions();

  const addGoal = (data: GoalFormData) => {
    setIsLoading(true);
    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: 0,
      targetDate: data.targetDate,
      type: data.type,
      category: data.category,
      userId: 'default_user',
      createdAt: new Date().toISOString(),
      completed: false,
    };

    setGoals(prev => [...prev, newGoal]);
    setIsLoading(false);
  };

  const updateGoal = (id: string, data: GoalFormData) => {
    setIsLoading(true);
    setGoals(prev => 
      prev.map(goal =>
        goal.id === id
          ? { 
              ...goal, 
              ...data, 
              targetAmount: parseFloat(data.targetAmount)
            }
          : goal
      )
    );
    setIsLoading(false);
  };

  const deleteGoal = (id: string) => {
    setIsLoading(true);
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setIsLoading(false);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setIsLoading(true);
    setGoals(prev => 
      prev.map(goal =>
        goal.id === id
          ? { 
              ...goal, 
              currentAmount: goal.currentAmount + amount,
              completed: (goal.currentAmount + amount) >= goal.targetAmount
            }
          : goal
      )
    );
    setIsLoading(false);
  };

  const getGoalProgress = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { percentage: 0, remaining: 0 };

    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;

    return { percentage, remaining };
  };

  return (
    <GoalContext.Provider value={{
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      updateGoalProgress,
      getGoalProgress,
      isLoading
    }}>
      {children}
    </GoalContext.Provider>
  );
};
