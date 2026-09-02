import { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpensesContext';
import { DEFAULT_CATEGORIES } from '../types/expense';
import type { Expense } from '../types/expense';
import { formatCurrency, formatDate, formatMonth } from '../utils/format';
import './Reports.css';

type PeriodId = 'month' | 'quarter' | 'year' | 'all';

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'Last 3 months' },
  { id: 'year', label: 'This year' },
  { id: 'all', label: 'All time' },
];

const getPeriodStart = (period: PeriodId) => {
  const now = new Date();
  switch (period) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
};

const toCsv = (expenses: Expense[]) => {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = expenses.map((exp) =>
    [
      exp.date.toISOString().split('T')[0],
      escape(exp.title),
      exp.category,
      String(exp.amount),
      escape(exp.description || ''),
    ].join(',')
  );
  return ['Date,Title,Category,Amount,Description', ...rows].join('\n');
};

const Reports = () => {
  const { expenses, loading } = useExpenses();
  const [period, setPeriod] = useState<PeriodId>('month');

  const filtered = useMemo(() => {
    const start = getPeriodStart(period);
    if (!start) return expenses;
    return expenses.filter((exp) => exp.date >= start);
  }, [expenses, period]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
    const sorted = [...filtered].sort((a, b) => b.amount - a.amount);

    const byDay = new Map<string, number>();
    filtered.forEach((exp) => {
      const key = exp.date.toISOString().split('T')[0];
      byDay.set(key, (byDay.get(key) || 0) + exp.amount);
    });

    const busiestDay = Array.from(byDay.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      count: filtered.length,
      average: filtered.length > 0 ? total / filtered.length : 0,
      largest: sorted[0] || null,
      dailyAverage: byDay.size > 0 ? total / byDay.size : 0,
      busiestDay: busiestDay ? { date: new Date(busiestDay[0]), amount: busiestDay[1] } : null,
    };
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return { date, total: 0 };
    });

    expenses.forEach((exp) => {
      const bucket = months.find(
        (month) =>
          month.date.getFullYear() === exp.date.getFullYear() &&
          month.date.getMonth() === exp.date.getMonth()
      );
      if (bucket) bucket.total += exp.amount;
    });

    const peak = Math.max(...months.map((month) => month.total), 1);
    return months.map((month) => ({ ...month, height: (month.total / peak) * 100 }));
  }, [expenses]);

  const categoryRows = useMemo(() => {
    const totals = new Map<string, { amount: number; count: number }>();
    filtered.forEach((exp) => {
      const current = totals.get(exp.category) || { amount: 0, count: 0 };
      totals.set(exp.category, { amount: current.amount + exp.amount, count: current.count + 1 });
    });

    return Array.from(totals.entries())
      .map(([id, value]) => {
        const category =
          DEFAULT_CATEGORIES.find((c) => c.id === id) ||
          DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
        return {
          ...category,
          ...value,
          share: stats.total > 0 ? (value.amount / stats.total) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, stats.total]);

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page-section">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Building your report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-section">
        <div className="reports-toolbar">
          <div className="reports-period">
            {PERIODS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`reports-period-btn ${period === option.id ? 'active' : ''}`}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button className="reports-export-btn" onClick={handleExport} disabled={filtered.length === 0}>
            Export CSV
          </button>
        </div>

        <div className="reports-summary">
          <div className="reports-summary-item">
            <p className="reports-summary-label">Total spent</p>
            <p className="reports-summary-value">{formatCurrency(stats.total)}</p>
          </div>
          <div className="reports-summary-item">
            <p className="reports-summary-label">Expenses</p>
            <p className="reports-summary-value">{stats.count}</p>
          </div>
          <div className="reports-summary-item">
            <p className="reports-summary-label">Average expense</p>
            <p className="reports-summary-value">{formatCurrency(stats.average)}</p>
          </div>
          <div className="reports-summary-item">
            <p className="reports-summary-label">Average per active day</p>
            <p className="reports-summary-value">{formatCurrency(stats.dailyAverage)}</p>
          </div>
        </div>
      </div>

      <div className="page-section">
        <h2 className="page-section-title">Last 6 Months</h2>
        <p className="page-section-subtitle">Total spending per month, independent of the filter above.</p>

        <div className="reports-trend">
          {monthlyTrend.map((month) => (
            <div key={month.date.toISOString()} className="reports-trend-column">
              <span className="reports-trend-value">
                {month.total > 0 ? formatCurrency(month.total) : ''}
              </span>
              <div className="reports-trend-bar-track">
                <div className="reports-trend-bar" style={{ height: `${month.height}%` }} />
              </div>
              <span className="reports-trend-label">{formatMonth(month.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-columns">
        <div className="page-section">
          <h2 className="page-section-title">Category Breakdown</h2>
          <p className="page-section-subtitle">Where your money went in the selected period.</p>

          {categoryRows.length === 0 ? (
            <div className="page-empty">
              <p>No expenses in this period.</p>
            </div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Entries</th>
                  <th>Amount</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="reports-table-category">
                        <span>{row.icon}</span>
                        {row.name}
                      </span>
                    </td>
                    <td>{row.count}</td>
                    <td>{formatCurrency(row.amount)}</td>
                    <td>
                      <span className="reports-table-share" style={{ color: row.color }}>
                        {row.share.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="page-section">
          <h2 className="page-section-title">Highlights</h2>
          <p className="page-section-subtitle">Notable entries in the selected period.</p>

          {stats.count === 0 ? (
            <div className="page-empty">
              <p>Nothing to highlight yet.</p>
            </div>
          ) : (
            <ul className="reports-highlights">
              {stats.largest && (
                <li>
                  <span className="reports-highlight-label">Largest expense</span>
                  <span className="reports-highlight-value">
                    {stats.largest.title} — {formatCurrency(stats.largest.amount)}
                  </span>
                  <span className="reports-highlight-meta">{formatDate(stats.largest.date)}</span>
                </li>
              )}
              {stats.busiestDay && (
                <li>
                  <span className="reports-highlight-label">Highest spending day</span>
                  <span className="reports-highlight-value">{formatCurrency(stats.busiestDay.amount)}</span>
                  <span className="reports-highlight-meta">{formatDate(stats.busiestDay.date)}</span>
                </li>
              )}
              {categoryRows[0] && (
                <li>
                  <span className="reports-highlight-label">Top category</span>
                  <span className="reports-highlight-value">
                    {categoryRows[0].icon} {categoryRows[0].name}
                  </span>
                  <span className="reports-highlight-meta">
                    {formatCurrency(categoryRows[0].amount)} · {categoryRows[0].share.toFixed(1)}% of spending
                  </span>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
