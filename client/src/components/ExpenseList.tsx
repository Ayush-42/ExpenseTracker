import { useState, useMemo } from 'react';
import type { Expense } from '../types/expense';
import { DEFAULT_CATEGORIES } from '../types/expense';
import './ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const ExpenseList = ({ expenses, onEdit, onDelete, loading }: ExpenseListProps) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((exp) => exp.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          exp.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return b.date.getTime() - a.date.getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    return filtered;
  }, [expenses, filterCategory, searchQuery, sortBy]);

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find((cat) => cat.id === categoryId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="expense-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="expense-list-filters">
        <div className="expense-list-search">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="expense-list-search-input"
          />
        </div>

        <div className="expense-list-filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="expense-list-filter-select"
          >
            <option value="all">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="expense-list-filter-select"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="expense-list-empty">
          <p>No expenses found</p>
          {expenses.length === 0 && <p className="expense-list-empty-hint">Add your first expense to get started!</p>}
        </div>
      ) : (
        <div className="expense-list-items">
          {filteredExpenses.map((expense) => {
            const category = getCategoryInfo(expense.category);
            return (
              <div key={expense.id} className="expense-item">
                <div className="expense-item-icon" style={{ backgroundColor: `${category.color}20` }}>
                  <span style={{ color: category.color }}>{category.icon}</span>
                </div>
                <div className="expense-item-content">
                  <div className="expense-item-header">
                    <h3 className="expense-item-title">{expense.title}</h3>
                    <span className="expense-item-amount">{formatAmount(expense.amount)}</span>
                  </div>
                  <div className="expense-item-meta">
                    <span className="expense-item-category" style={{ color: category.color }}>
                      {category.name}
                    </span>
                    <span className="expense-item-date">{formatDate(expense.date)}</span>
                  </div>
                  {expense.description && (
                    <p className="expense-item-description">{expense.description}</p>
                  )}
                </div>
                <div className="expense-item-actions">
                  <button
                    onClick={() => onEdit(expense)}
                    className="expense-item-action-btn edit"
                    aria-label="Edit expense"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this expense?')) {
                        onDelete(expense.id);
                      }
                    }}
                    className="expense-item-action-btn delete"
                    aria-label="Delete expense"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;

