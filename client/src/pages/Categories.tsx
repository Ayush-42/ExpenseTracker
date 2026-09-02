import { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { useExpenseDialog } from '../components/DashboardLayout';
import { DEFAULT_CATEGORIES } from '../types/expense';
import { formatCurrency, formatDate } from '../utils/format';
import './Categories.css';

const Categories = () => {
  const { expenses, loading } = useExpenses();
  const { openAddExpense, openEditExpense } = useExpenseDialog();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const rows = DEFAULT_CATEGORIES.map((category) => {
      const items = expenses.filter((exp) => exp.category === category.id);
      const spent = items.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        ...category,
        count: items.length,
        spent,
        average: items.length > 0 ? spent / items.length : 0,
        share: total > 0 ? (spent / total) * 100 : 0,
      };
    }).sort((a, b) => b.spent - a.spent);

    return { rows, total };
  }, [expenses]);

  const selected = selectedId ? summary.rows.find((row) => row.id === selectedId) : null;
  const selectedExpenses = useMemo(
    () =>
      selectedId
        ? expenses
            .filter((exp) => exp.category === selectedId)
            .sort((a, b) => b.date.getTime() - a.date.getTime())
        : [],
    [expenses, selectedId]
  );

  if (loading) {
    return (
      <div className="page-section">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-section">
        <h2 className="page-section-title">Spending by Category</h2>
        <p className="page-section-subtitle">
          {summary.total > 0
            ? `${formatCurrency(summary.total)} across ${expenses.length} expenses. Select a category to see its entries.`
            : 'Add an expense to see how your spending splits across categories.'}
        </p>

        <div className="categories-grid">
          {summary.rows.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`category-card ${selectedId === row.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(selectedId === row.id ? null : row.id)}
              style={{ borderTopColor: row.color }}
            >
              <div className="category-card-head">
                <span className="category-card-icon" style={{ backgroundColor: `${row.color}20`, color: row.color }}>
                  {row.icon}
                </span>
                <div>
                  <p className="category-card-name">{row.name}</p>
                  <p className="category-card-count">
                    {row.count} {row.count === 1 ? 'expense' : 'expenses'}
                  </p>
                </div>
              </div>

              <p className="category-card-amount">{formatCurrency(row.spent)}</p>

              <div className="category-card-bar">
                <div
                  className="category-card-bar-fill"
                  style={{ width: `${row.share}%`, backgroundColor: row.color }}
                />
              </div>

              <div className="category-card-meta">
                <span>{row.share.toFixed(1)}% of total</span>
                <span>avg {formatCurrency(row.average)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="page-section categories-detail">
          <div className="categories-detail-header">
            <div>
              <h2 className="page-section-title">
                {selected.icon} {selected.name}
              </h2>
              <p className="page-section-subtitle">
                {formatCurrency(selected.spent)} spent in {selected.count}{' '}
                {selected.count === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <button className="dashboard-add-btn" onClick={openAddExpense}>
              + Add Expense
            </button>
          </div>

          {selectedExpenses.length === 0 ? (
            <div className="page-empty">
              <p>Nothing recorded in this category yet.</p>
            </div>
          ) : (
            <ul className="categories-detail-list">
              {selectedExpenses.map((expense) => (
                <li key={expense.id}>
                  <button type="button" onClick={() => openEditExpense(expense)}>
                    <div>
                      <p className="categories-detail-title">{expense.title}</p>
                      <p className="categories-detail-date">{formatDate(expense.date)}</p>
                    </div>
                    <span className="categories-detail-amount">{formatCurrency(expense.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
