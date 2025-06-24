import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { transactions, getTransactionsByPeriod } = useTransactions();
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'xlsx'>('csv');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFilteredTransactions = () => {
    return getTransactionsByPeriod(startDate, endDate);
  };

  const getMonthlyData = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};

    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      receita: data.income,
      despesa: data.expense,
      saldo: data.income - data.expense
    }));
  };

  const getCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryData: { [key: string]: number } = {};

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
      });

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];
    
    return Object.entries(categoryData)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getReportSummary = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance, transactionCount: filteredTransactions.length };
  };

  const exportReport = async () => {
    const filteredTransactions = getFilteredTransactions();
    if (exportType === 'csv') {
      const csvContent = [
        ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'],
        ...filteredTransactions.map(t => [
          new Date(t.date).toLocaleDateString('pt-BR'),
          t.type === 'income' ? 'Receita' : 'Despesa',
          t.description,
          t.category,
          t.amount.toFixed(2)
        ])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_${startDate}_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportType === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(filteredTransactions.map(t => ({
        Data: new Date(t.date).toLocaleDateString('pt-BR'),
        Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        Descrição: t.description,
        Categoria: t.category,
        Valor: t.amount
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
      XLSX.writeFile(wb, `relatorio_${startDate}_${endDate}.xlsx`);
    } else if (exportType === 'pdf') {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const margin = 15;
      let y = margin;
      // Cabeçalho visual
      doc.setFillColor(255, 102, 0);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Relatório Financeiro', margin, 12);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      y = 22;
      doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`, margin, y);
      y += 8;
      const summary = getReportSummary();
      doc.setFontSize(11);
      doc.text(`Receitas: ${formatCurrency(summary.totalIncome)}`, margin, y);
      doc.text(`Despesas: ${formatCurrency(summary.totalExpense)}`, margin + 65, y);
      doc.text(`Saldo: ${formatCurrency(summary.balance)}`, margin + 130, y);
      y += 8;
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, 210 - margin, y);
      y += 6;
      // Agrupar por data
      const grouped = filteredTransactions.reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString('pt-BR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
      }, {} as Record<string, typeof filteredTransactions>);
      Object.entries(grouped).forEach(([date, txs]) => {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(date, margin, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        // Cabeçalho da tabela
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        doc.text('Tipo', margin, y);
        doc.text('Descrição', margin + 35, y);
        doc.text('Categoria', margin + 100, y);
        doc.text('Valor', 210 - margin - 15, y, { align: 'right' });
        y += 5;
        y += 2;
        txs.forEach(t => {
          if (y > 270) { doc.addPage(); y = margin; }
          // Cores
          let color = [0,0,0];
          let valueColor = [0,0,0];
          if (t.type === 'expense') {
            color = [220, 38, 38]; // vermelho
            valueColor = [220, 38, 38];
          } else {
            color = [34, 197, 94]; // verde
            valueColor = [34, 197, 94];
          }
          // Azul para detalhes pequenos (exemplo: categoria de "Lazer")
          if (t.category && t.category.toLowerCase().includes('lazer')) {
            color = [37, 99, 235]; // azul
          }
          const tipo = t.type === 'income' ? 'Receita' : 'Despesa';
          const desc = t.description.length > 40 ? t.description.slice(0, 40) + '...' : t.description;
          const cat = t.category;
          let valor = `R$ ${t.amount.toFixed(2)}`;
          if (t.type === 'expense') valor = '-' + valor;
          // Tipo
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(tipo, margin, y);
          // Descrição
          doc.setTextColor(0, 0, 0);
          doc.text(desc, margin + 35, y);
          // Categoria
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(cat, margin + 100, y);
          // Valor
          doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
          doc.text(valor, 210 - margin - 15, y, { align: 'right' });
          doc.setTextColor(0, 0, 0);
          y += 7;
        });
        y += 3;
      });
      // Rodapé
      const now = new Date();
      doc.setFontSize(9);
      doc.setTextColor(120,120,120);
      doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`, margin, 295);
      doc.save(`relatorio_${startDate}_${endDate}.pdf`);
    }
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const summary = getReportSummary();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Análise detalhada das suas finanças
            </p>
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <select
              className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground dark:bg-card dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-colors"
              value={exportType}
              onChange={e => setExportType(e.target.value as 'csv' | 'pdf' | 'xlsx')}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Planilha</option>
              <option value="pdf">PDF</option>
            </select>
            <Button onClick={exportReport} className="w-full sm:w-auto">
              <span className="block sm:hidden"><Download className="mx-auto h-5 w-5" /></span>
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className={`h-8 w-8 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.transactionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolução do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
