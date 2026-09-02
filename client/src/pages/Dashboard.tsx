import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../context/ExpensesContext';
import { useExpenseDialog } from '../components/DashboardLayout';
import DateRangeFilter from '../components/DateRangeFilter';
import StatisticsCards from '../components/StatisticsCards';
import ExpenseChart from '../components/ExpenseChart';
import { DEFAULT_CATEGORIES } from '../types/expense';
import { formatCurrency, formatShortDate } from '../utils/format';
import type { DateRange, DateRangePreset } from '../utils/dateRange';
import { isInRange, rangeForPreset, thisMonthRange } from '../utils/dateRange';
import './Dashboard.css';

const Dashboard = () => {
  const { expenses, loading } = useExpenses();
  const { openAddExpense } = useExpenseDialog();
  const [preset, setPreset] = useState<DateRangePreset>('this-month');
  const [customRange, setCustomRange] = useState<DateRange | null>(null);

  const range = useMemo(
    () => rangeForPreset(preset, customRange ?? thisMonthRange()),
    [preset, customRange]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => isInRange(expense.date, range)),
    [expenses, range]
  );

  const handleRangeChange = (nextPreset: DateRangePreset, nextCustom?: DateRange) => {
    setPreset(nextPreset);
    if (nextPreset === 'custom' && nextCustom) {
      setCustomRange(nextCustom);
    }
  };

  return (
    <>
      <DateRangeFilter preset={preset} range={range} onChange={handleRangeChange} />
      <StatisticsCards expenses={filteredExpenses} range={range} preset={preset} />

      <div className="dashboard-grid">
        <div className="dashboard-grid-item">
          <ExpenseChart expenses={filteredExpenses} />
        </div>

        <div className="dashboard-grid-item">
          <div className="dashboard-recent-expenses">
            <div className="dashboard-recent-header">
              <h3>Recent Expenses</h3>
              <Link to="/dashboard/expenses" className="dashboard-view-all-btn">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="dashboard-empty">
                <p>
                  {expenses.length === 0
                    ? 'No expenses yet'
                    : 'No expenses in this date range'}
                </p>
                {expenses.length === 0 && (
                  <button className="dashboard-add-btn-small" onClick={openAddExpense}>
                    Add Your First Expense
                  </button>
                )}
              </div>
            ) : (
              <div className="dashboard-recent-list">
                {filteredExpenses.slice(0, 5).map((expense) => {
                  const category =
                    DEFAULT_CATEGORIES.find((c) => c.id === expense.category) ||
                    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
                  return (
                    <div key={expense.id} className="dashboard-recent-item">
                      <span className="dashboard-recent-icon" style={{ color: category.color }}>
                        {category.icon}
                      </span>
                      <div className="dashboard-recent-content">
                        <p className="dashboard-recent-title">{expense.title}</p>
                        <p className="dashboard-recent-date">{formatShortDate(expense.date)}</p>
                      </div>
                      <span className="dashboard-recent-amount">{formatCurrency(expense.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
