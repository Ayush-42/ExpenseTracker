import { useMemo } from 'react';
import type { Expense } from '../types/expense';
import { DEFAULT_CATEGORIES } from '../types/expense';
import './ExpenseChart.css';

interface ExpenseChartProps {
  expenses: Expense[];
}

const ExpenseChart = ({ expenses }: ExpenseChartProps) => {
  const chartData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = DEFAULT_CATEGORIES.find((c) => c.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
        return {
          category: category.name,
          categoryId,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          icon: category.icon,
          color: category.color,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (chartData.length === 0) {
    return (
      <div className="expense-chart-empty">
        <p>No expenses to display</p>
        <p className="expense-chart-empty-hint">Add expenses to see category breakdown</p>
      </div>
    );
  }

  return (
    <div className="expense-chart">
      <h3 className="expense-chart-title">Expenses by Category</h3>
      <div className="expense-chart-content">
        {chartData.map((item) => (
          <div key={item.categoryId} className="expense-chart-item">
            <div className="expense-chart-item-header">
              <div className="expense-chart-item-info">
                <span className="expense-chart-item-icon">{item.icon}</span>
                <span className="expense-chart-item-category">{item.category}</span>
              </div>
              <span className="expense-chart-item-amount">{formatCurrency(item.amount)}</span>
            </div>
            <div className="expense-chart-item-bar">
              <div
                className="expense-chart-item-bar-fill"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <div className="expense-chart-item-percentage">{item.percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;

