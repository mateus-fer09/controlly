import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit2, Trash2, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useGoals } from '@/contexts/GoalContext';
import GoalModal from '@/components/GoalModal';
import GoalProgressModal from '@/components/GoalProgressModal';

const Goals = () => {
  const { goals, deleteGoal } = useGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [progressModal, setProgressModal] = useState<{
    isOpen: boolean;
    goalId: string;
    goalTitle: string;
    currentAmount: number;
    targetAmount: number;
  }>({
    isOpen: false,
    goalId: '',
    goalTitle: '',
    currentAmount: 0,
    targetAmount: 0
  });

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleOpenProgressModal = (goal: any) => {
    setProgressModal({
      isOpen: true,
      goalId: goal.id,
      goalTitle: goal.title,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount
    });
  };

  const handleCloseProgressModal = () => {
    setProgressModal({
      isOpen: false,
      goalId: '',
      goalTitle: '',
      currentAmount: 0,
      targetAmount: 0
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Metas Financeiras</h1>
            <p className="text-muted-foreground mt-1">
              Defina e acompanhe o progresso das suas metas financeiras
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
              <span className="block sm:hidden"><Plus className="mx-auto h-5 w-5" /></span>
              <span className="hidden sm:inline">Nova Meta</span>
            </Button>
          </div>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma meta criada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira meta financeira para manter o foco nos seus objetivos
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const isCompleted = goal.completed || progress >= 100;
              const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
              const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={goal.id} className={`${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {goal.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {goal.type === 'savings' ? 'Poupança' : 'Redução de Gastos'}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Progresso</span>
                        <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`}
                      />
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {progress.toFixed(1)}% concluído
                        </span>
                        <span className="font-medium">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>

                      {!isCompleted && (
                        <div className="text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Restante:</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(remainingAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Prazo:</span>
                            <span className={`font-medium ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-600'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
                            </span>
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Meta concluída!
                        </div>
                      )}

                      {!isCompleted && (
                        <Button
                          onClick={() => handleOpenProgressModal(goal)}
                          className="w-full mt-3"
                          size="sm"
                          variant="outline"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Adicionar Progresso
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          goal={editingGoal}
        />

        {progressModal.isOpen && (
          <GoalProgressModal
            isOpen={progressModal.isOpen}
            onClose={handleCloseProgressModal}
            goalId={progressModal.goalId}
            goalTitle={progressModal.goalTitle}
            currentAmount={progressModal.currentAmount}
            targetAmount={progressModal.targetAmount}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Goals;
